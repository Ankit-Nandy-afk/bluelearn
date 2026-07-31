import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import type { Guide } from "@bluelearn/schemas";
import { Separator } from "@/components/ui/separator";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { GuideReader } from "@/components/GuideReader";

import { castDecision, getReviewCase } from "@/lib/api/reviews";

import "katex/dist/katex.min.css";

export type Review = {
  decision: string;
  notes: string;
  reasons: Array<string>;
};

export const Route = createFileRoute("/review/$caseId")({
  loader: async ({ params, abortController }) => {
    const revisionData = await getReviewCase(params.caseId, {
      signal: abortController.signal,
    });
    return revisionData;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { caseId } = Route.useParams();
  const revisionData = Route.useLoaderData();
  const [submitting, setSubmitting] = useState<
    "Submitting..." | "Submitted." | ""
  >("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const revision = revisionData.revision;

  const guide: Guide | null = revision
    ? {
        slug: "",
        variant_slug: null,
        title: revision.title ?? "",
        author: "",
        summary: revision.summary ?? null,
        body: revision.body ?? null,
        duration_minutes: 0,
        created_at: revision.created_at,
        tags: [],
        prerequisites: [],
      }
    : null;

  const [review, setReview] = useState<Review>({
    decision: "",
    notes: "",
    reasons: [],
  });

  const REASONS = [
    { value: "hierarchy_issue", label: "Hierarchy Issues" },
    { value: "factual_error", label: "Factual Error" },
    { value: "duplicate_content", label: "Duplicate Content" },
    { value: "scope_violation", label: "Scope Violation" },
    { value: "clarity_issue", label: "Clarity Issues" },
    {
      value: "missing_required_information",
      label: "Missing Required Information",
    },
  ];

  const validateReview = () => {
    let missingFields = "";
    if (review.decision == "approve") return "";

    if (review.reasons.length === 0)
      missingFields += "Rejections require at least one reason. ";
    if (review.notes.length === 0)
      missingFields += "Rejections require a note. ";

    return missingFields;
  };

  const submitDecision = async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const missingFields = validateReview();
    if (missingFields.length !== 0) {
      setSubmitError(
        "There were errors with your submission: \n" + missingFields
      );
      return;
    }

    setSubmitting("Submitting...");
    setSubmitError(null);

    try {
      await castDecision(caseId, review, { signal: controller.signal });
      setSubmitting("Submitted.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setSubmitError("There was an unexpected error with your submission.");
        setSubmitting("");
      }
    }
  };

  return (
    <div className="mx-auto h-[calc(100vh-70px)] max-w-7xl border-x bg-background">
      <section className="grid grid-cols-[320px_1fr] border-b">
        <aside className="h-[calc(100vh-70px)] overflow-y-auto border-r px-6 py-6">
          <CollapsibleSection
            title={<p className="ml-auto">Submission Review</p>}
            defaultOpen={true}
          >
            <div className="flex justify-around">
              <Button
                className="btn-reject"
                size="lg"
                onClick={() => {
                  if (review.decision == "reject") {
                    setReview((prev) => ({
                      ...prev,
                      decision: "",
                    }));
                  } else {
                    setReview((prev) => ({
                      ...prev,
                      decision: "reject",
                    }));
                  }
                }}
                disabled={review.decision == "approve"}
              >
                Reject
              </Button>
              <Button
                className="btn-approve"
                size="lg"
                onClick={() => {
                  if (review.decision == "approve") {
                    setReview((prev) => ({
                      ...prev,
                      decision: "",
                    }));
                  } else {
                    setReview((prev) => ({
                      ...prev,
                      decision: "approve",
                    }));
                  }
                }}
                disabled={review.decision == "reject"}
              >
                Approve
              </Button>
            </div>

            <FieldGroup>
              <Field className="space-y-2">
                <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                  Notes
                </FieldLabel>

                <textarea
                  className="h-32 w-full min-w-0 resize-none rounded-md border border-input bg-input/20 p-2 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                  rows={4}
                  placeholder="Add notes with more details."
                  required
                  value={review.notes}
                  onChange={(e) =>
                    setReview((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </Field>

              {review.decision == "reject" && (
                <Field className="space-y-2">
                  <FieldLabel className="font-mono tracking-[0.08em] uppercase">
                    Reasons
                  </FieldLabel>

                  <Combobox
                    multiple
                    items={REASONS}
                    value={review.reasons}
                    onValueChange={(reasons) =>
                      setReview((prev) => ({
                        ...prev,
                        reasons,
                      }))
                    }
                  />
                </Field>
              )}
            </FieldGroup>

            <FieldGroup>
              <Button
                className="btn-pri"
                size="lg"
                onClick={() => {
                  submitDecision();
                }}
              >
                Submit
              </Button>
            </FieldGroup>

            <FieldGroup>
              <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                {submitError === null ? submitting : ""}
              </p>
              <p className="font-mono text-[11px] tracking-[0.08em] text-red-500 uppercase">
                {submitError ?? ""}
              </p>
            </FieldGroup>
          </CollapsibleSection>
        </aside>

        {/* MAIN */}
        <main className="h-[calc(100vh-70px)] min-w-0 overflow-y-auto px-10 py-8 lg:px-16">
          <p className="data-label text-[14px] tracking-[0.08em] text-muted-foreground uppercase">
            Review
          </p>

          <Separator className="mb-8" />

          <div className="rounded-md border bg-background p-4 shadow-none transition-colors hover:bg-muted">
            {guide ? (
              <GuideReader guide={guide} />
            ) : (
              <p className="font-mono text-[11px] tracking-[0.08em] text-red-500 uppercase">
                No guide revision found to display.
              </p>
            )}
          </div>
        </main>
      </section>
    </div>
  );
}
