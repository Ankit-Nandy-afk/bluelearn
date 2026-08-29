import { describe, expect, it } from "vitest";

import {
  hasMeaningfulText,
  validateReviewDecision,
} from "@/lib/reviewValidation";

const rejection = (notes: string) => ({
  decision: "reject",
  notes,
  reasons: ["inaccurate"],
});

describe("hasMeaningfulText", () => {
  it("accepts ordinary prose", () => {
    expect(hasMeaningfulText("Needs a worked example.")).toBe(true);
  });

  it("accepts notes written in non-Latin scripts", () => {
    expect(hasMeaningfulText("需要一个例子")).toBe(true);
    expect(hasMeaningfulText("يحتاج إلى مثال")).toBe(true);
    expect(hasMeaningfulText("Нужен пример")).toBe(true);
  });

  it("accepts a note that is only digits", () => {
    expect(hasMeaningfulText("42")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(hasMeaningfulText("")).toBe(false);
  });

  it("rejects whitespace of any kind", () => {
    expect(hasMeaningfulText("   ")).toBe(false);
    expect(hasMeaningfulText("\t\n")).toBe(false);
  });

  it("rejects punctuation with no words", () => {
    expect(hasMeaningfulText("...")).toBe(false);
    expect(hasMeaningfulText("???")).toBe(false);
    expect(hasMeaningfulText("-")).toBe(false);
  });
});

describe("validateReviewDecision", () => {
  it("asks for a decision before anything else", () => {
    expect(
      validateReviewDecision({ decision: "", notes: "", reasons: [] })
    ).toBe("Choose approve or reject before submitting");
  });

  it("lets an approval through without notes or reasons", () => {
    expect(
      validateReviewDecision({ decision: "approve", notes: "", reasons: [] })
    ).toBe("");
  });

  it("lets a complete rejection through", () => {
    expect(validateReviewDecision(rejection("Missing prerequisites."))).toBe(
      ""
    );
  });

  // Regression test for #341: a note of only whitespace cleared the old
  // `notes.length === 0` check, so it reached the API and failed there against
  // `z.string().trim().min(1)` with a generic error instead of this guidance.
  it("rejects a note that is only whitespace", () => {
    expect(validateReviewDecision(rejection("   "))).toBe(
      "Rejections require a note"
    );
  });

  it("rejects a note that is only punctuation", () => {
    expect(validateReviewDecision(rejection("..."))).toBe(
      "Rejections require a note"
    );
  });

  it("still requires at least one reason", () => {
    expect(
      validateReviewDecision({
        decision: "reject",
        notes: "Needs work.",
        reasons: [],
      })
    ).toBe("Rejections require at least one reason");
  });

  it("reports both problems together", () => {
    expect(
      validateReviewDecision({ decision: "reject", notes: " ", reasons: [] })
    ).toBe("Rejections require at least one reason and a note");
  });
});
