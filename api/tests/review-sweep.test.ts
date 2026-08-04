import { describe, it, expect, beforeEach } from "vitest";
import { admin, makeUser } from "./helpers";
import {
  createReviewCase,
  createReviewPanel,
  createPanelMember,
  createGuideReviewCase,
  createVerifier,
  suspendAllVerifiers,
} from "./factories/reviews";
import {
  createGuideBase,
  createGuide,
  createGuideRevision,
} from "./factories/guides";
import { createSubject, tagGuideRevision } from "./factories/subjects";

describe("Database Layer: Review Case Time Limits & Sweep", () => {
  beforeEach(async () => {
    await suspendAllVerifiers();
  });

  it("submit_guide_revision sets default 2-day time_limit on the created review case", async () => {
    const author = await makeUser();
    const base = await createGuideBase();
    const guide = await createGuide(base.id);
    const revision = await createGuideRevision(guide.id, {
      title: "Differential Topology",
      summary: "Advanced manifold theory",
      body: "Content goes here...",
      author_id: author.userId,
      status: "draft",
    });

    const subject = await createSubject();
    await tagGuideRevision(revision.id, subject.id);

    // Call submit_guide_revision RPC using the author's client
    const { data: caseId, error } = await admin.rpc("submit_guide_revision", {
      p_revision_id: revision.id,
    });
    expect(error).toBeNull();
    expect(caseId).toBeTruthy();

    const { data: reviewCase, error: caseErr } = await admin
      .from("review_cases")
      .select("*")
      .eq("id", caseId!)
      .single();

    expect(caseErr).toBeNull();
    expect(reviewCase).toBeTruthy();
    // PostgreSQL interval '2 days'
    expect(reviewCase?.time_limit).toMatch(/2 days|48:00:00/);
  });

  it("sweep_expired_review_seats replaces expired seats (>48h) and draws replacement verifier", async () => {
    const author = await makeUser();
    const expiredVerifier = await createVerifier();
    const replacementVerifier = await createVerifier();

    const base = await createGuideBase();
    const guide = await createGuide(base.id);
    const revision = await createGuideRevision(guide.id, {
      author_id: author.userId,
    });
    const reviewCase = await createReviewCase(author.userId, {
      status: "in_review",
      time_limit: "2 days",
    });
    const panel = await createReviewPanel(reviewCase.id, {
      target_seat_count: 1,
    });

    // Seat the expired verifier with assigned_at set to 3 days ago (>48h)
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    const expiredSeat = await createPanelMember(
      panel.id,
      expiredVerifier.userId,
      {
        assigned_at: threeDaysAgo,
        status: "assigned",
      }
    );
    await createGuideReviewCase(reviewCase.id, revision.id);

    // Run sweep
    const { data: sweepRes, error: sweepErr } = await admin.rpc(
      "sweep_expired_review_seats"
    );
    expect(sweepErr).toBeNull();
    expect(sweepRes).toMatchObject({
      replaced_count: 1,
      assigned_count: 1,
      skipped: false,
    });

    // Verify old seat status is replaced
    const { data: updatedOldSeat } = await admin
      .from("panel_members")
      .select("*")
      .eq("id", expiredSeat.id)
      .single();
    expect(updatedOldSeat?.status).toBe("replaced");

    // Verify new seat is assigned to the replacement verifier
    const { data: panelSeats } = await admin
      .from("panel_members")
      .select("*")
      .eq("panel_id", panel.id)
      .eq("status", "assigned");

    expect(panelSeats).toHaveLength(1);
    expect(panelSeats![0].member_id).toBe(replacementVerifier.userId);

    // Newly assigned seat should have assigned_at close to now
    const assignedTime = new Date(panelSeats![0].assigned_at).getTime();
    expect(Date.now() - assignedTime).toBeLessThan(10000);
  });

  it("sweep_expired_review_seats does not replace completed seats even if assigned >48h ago", async () => {
    const author = await makeUser();
    const panelist = await createVerifier();

    const reviewCase = await createReviewCase(author.userId, {
      status: "in_review",
      time_limit: "2 days",
    });
    const panel = await createReviewPanel(reviewCase.id, {
      target_seat_count: 1,
    });

    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    const seat = await createPanelMember(panel.id, panelist.userId, {
      assigned_at: threeDaysAgo,
      status: "completed",
    });

    const { data: sweepRes, error } = await admin.rpc(
      "sweep_expired_review_seats"
    );
    expect(error).toBeNull();
    expect(sweepRes).toMatchObject({
      replaced_count: 0,
      assigned_count: 0,
      skipped: false,
    });

    const { data: checkSeat } = await admin
      .from("panel_members")
      .select("*")
      .eq("id", seat.id)
      .single();
    expect(checkSeat?.status).toBe("completed");
  });

  it("sweep_expired_review_seats does not replace seats within the 48h limit", async () => {
    const author = await makeUser();
    const panelist = await createVerifier();

    const reviewCase = await createReviewCase(author.userId, {
      status: "in_review",
      time_limit: "2 days",
    });
    const panel = await createReviewPanel(reviewCase.id, {
      target_seat_count: 1,
    });

    // 12 hours ago (<48h)
    const twelveHoursAgo = new Date(
      Date.now() - 12 * 60 * 60 * 1000
    ).toISOString();
    const seat = await createPanelMember(panel.id, panelist.userId, {
      assigned_at: twelveHoursAgo,
      status: "assigned",
    });

    const { data: sweepRes, error } = await admin.rpc(
      "sweep_expired_review_seats"
    );
    expect(error).toBeNull();
    expect(sweepRes).toMatchObject({
      replaced_count: 0,
      assigned_count: 0,
      skipped: false,
    });

    const { data: checkSeat } = await admin
      .from("panel_members")
      .select("*")
      .eq("id", seat.id)
      .single();
    expect(checkSeat?.status).toBe("assigned");
  });

  it("sweep_expired_review_seats handles pool exhaustion and backfills on subsequent sweep", async () => {
    const author = await makeUser();
    const expiredVerifier = await createVerifier();
    // Note: No other verifiers available

    const reviewCase = await createReviewCase(author.userId, {
      status: "in_review",
      time_limit: "2 days",
    });
    const panel = await createReviewPanel(reviewCase.id, {
      target_seat_count: 1,
    });

    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    await createPanelMember(panel.id, expiredVerifier.userId, {
      assigned_at: threeDaysAgo,
      status: "assigned",
    });

    // First sweep: old verifier replaced, but pool exhausted so assigned_count is 0
    const { data: res1, error: err1 } = await admin.rpc(
      "sweep_expired_review_seats"
    );
    expect(err1).toBeNull();
    expect(res1).toMatchObject({
      replaced_count: 1,
      assigned_count: 0,
      skipped: false,
    });

    // Now a new verifier registers / is promoted
    const newVerifier = await createVerifier();

    // Second sweep: backfills the missing seat for the active under-seated panel
    const { data: res2, error: err2 } = await admin.rpc(
      "sweep_expired_review_seats"
    );
    expect(err2).toBeNull();
    expect(res2).toMatchObject({
      replaced_count: 0,
      assigned_count: 1,
      skipped: false,
    });

    const { data: panelSeats } = await admin
      .from("panel_members")
      .select("*")
      .eq("panel_id", panel.id)
      .eq("status", "assigned");

    expect(panelSeats).toHaveLength(1);
    expect(panelSeats![0].member_id).toBe(newVerifier.userId);
  });

  it("never reseats the case author or someone who already held a seat on the panel", async () => {
    const author = await createVerifier(); // author is also a verifier
    const firstVerifier = await createVerifier();

    const reviewCase = await createReviewCase(author.userId, {
      status: "in_review",
      time_limit: "2 days",
    });
    const panel = await createReviewPanel(reviewCase.id, {
      target_seat_count: 1,
    });

    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    await createPanelMember(panel.id, firstVerifier.userId, {
      assigned_at: threeDaysAgo,
      status: "assigned",
    });

    // With only the author and firstVerifier in the pool, sweep should NOT pick the author
    // and should NOT re-pick firstVerifier.
    const { data: sweepRes, error } = await admin.rpc(
      "sweep_expired_review_seats"
    );
    expect(error).toBeNull();
    expect(sweepRes).toMatchObject({
      replaced_count: 1,
      assigned_count: 0,
      skipped: false,
    });

    const { data: panelSeats } = await admin
      .from("panel_members")
      .select("*")
      .eq("panel_id", panel.id);

    // Only the one replaced seat exists
    expect(panelSeats).toHaveLength(1);
    expect(panelSeats![0].status).toBe("replaced");
  });
});
