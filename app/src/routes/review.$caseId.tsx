import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import type { ReaderGuide } from "@/components/GuideReader";
import { Separator } from "@/components/ui/separator";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideReader } from "@/components/GuideReader";
import { cn } from "@/lib/utils";

import { castDecision, getReviewCase } from "@/lib/api/reviews";

import "katex/dist/katex.min.css";

export type Review = {
  decision: string;
  notes: string;
  reasons: Array<string>;
};

function ChangeSection({
  label,
  count,
  empty,
  children,
}: {
  label: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-xs/relaxed font-bold tracking-[0.08em] uppercase">
        {label}
      </p>
      {count === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">{children}</ul>
      )}
    </div>
  );
}

function ChangeRow({
  label,
  badge,
}: {
  label: string;
  badge?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-xs">
      <span className="min-w-0 truncate">{label}</span>
      {badge}
    </li>
  );
}

function ChangeBadge({
  tone,
  children,
}: {
  tone: "new" | "existing";
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-mono tracking-[0.06em] uppercase",
        tone === "new"
          ? "bg-brand-blue/15 text-brand-dk-blue dark:text-brand-blue"
          : "bg-muted-foreground/8 text-muted-foreground"
      )}
    >
      {children}
    </Badge>
  );
}

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
  const [submitting, setSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const revision = revisionData.revision;

  const guide: ReaderGuide | null = revision
    ? {
        slug: "",
        variant_slug: null,
        title: revision.title ?? "",
        author: "",
        summary: revision.summary ?? null,
        body: revision.body ?? null,
        duration_minutes: revision.duration_minutes,
        created_at: revision.created_at,
        tags: revision.tags,
        prerequisites: [],
      }
    : null;

  const subjects = revision?.tags ?? [];

  // Reviewers can revote while the case is open, so start from their last vote.
  const priorDecision = revisionData.viewer_decision;

  const [review, setReview] = useState<Review>({
    decision:
      priorDecision === null
        ? ""
        : priorDecision.decision === "approved"
          ? "approve"
          : "reject",
    notes: priorDecision?.notes ?? "",
    reasons: priorDecision?.reasons ?? [],
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
    if (review.decision === "")
      return "Choose approve or reject before submitting";
    if (review.decision === "approve") return "";

    const missing = [];
    if (review.reasons.length === 0) missing.push("at least one reason");
    if (review.notes.length === 0) missing.push("a note");

    return missing.length === 0
      ? ""
      : `Rejections require ${missing.join(" and ")}`;
  };

  const submitDecision = async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const missingFields = validateReview();
    if (missingFields.length !== 0) {
      toast.error(missingFields);
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting decision...");

    try {
      await castDecision(caseId, review, { signal: controller.signal });
      toast.success("Decision submitted", { id: toastId });
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("There was an unexpected error with your submission", {
          id: toastId,
        });
      } else {
        toast.dismiss(toastId);
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto h-[calc(100vh-70px)] max-w-7xl border-x bg-background">
      <section className="grid grid-cols-[320px_1fr] border-b">
        <aside className="h-[calc(100vh-70px)] space-y-4 overflow-y-auto border-r px-6 py-6">
          <section className="space-y-4">
            <p className="font-mono text-xs/relaxed font-bold tracking-[0.08em] uppercase">
              Review Actions
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={cn(
                  "h-9 border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400",
                  review.decision == "reject" && "bg-red-500/10"
                )}
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
              >
                <X />
                Reject
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "h-9 border-green-600/40 text-green-700 hover:bg-green-600/10 hover:text-green-700 dark:text-green-400 dark:hover:text-green-400",
                  review.decision == "approve" && "bg-green-600/10"
                )}
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
              >
                <Check />
                Approve
              </Button>
            </div>

            <Separator />

            <FieldGroup className="gap-4">
              <Field className="space-y-2">
                <FieldLabel className="font-mono font-bold tracking-[0.08em] uppercase">
                  Notes
                </FieldLabel>

                <textarea
                  className="h-32 w-full min-w-0 resize-none rounded-md border border-input bg-input/20 p-2 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                  rows={4}
                  placeholder="Add notes to explain your decision..."
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
                  <FieldLabel className="font-mono font-bold tracking-[0.08em] uppercase">
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

            <Button
              className="btn-pri w-full py-2.5"
              size="lg"
              disabled={submitting}
              onClick={() => {
                submitDecision();
              }}
            >
              Submit Decision
            </Button>
          </section>

          <Separator />

          <section className="space-y-6">
            <ChangeSection
              label="Proposed Subjects"
              count={subjects.length}
              empty="None proposed."
            >
              {subjects.map((s) => (
                <ChangeRow
                  key={s.id}
                  label={s.name}
                  badge={
                    s.status === "draft" ? (
                      <ChangeBadge tone="new">New</ChangeBadge>
                    ) : (
                      <ChangeBadge tone="existing">Existing</ChangeBadge>
                    )
                  }
                />
              ))}
            </ChangeSection>

            <Separator />

            <ChangeSection
              label="Prerequisites"
              count={revisionData.prerequisites.length}
              empty="None declared."
            >
              {revisionData.prerequisites.map((p) => (
                <ChangeRow key={p.slug} label={p.title ?? p.slug} />
              ))}
            </ChangeSection>

            <Separator />

            <ChangeSection
              label="Todos"
              count={revisionData.todos.length}
              empty="None declared."
            >
              {revisionData.todos.map((t) => (
                <ChangeRow key={t.id} label={t.title} />
              ))}
            </ChangeSection>
          </section>
        </aside>

        {/* MAIN */}
        <main className="h-[calc(100vh-70px)] min-w-0 overflow-y-auto px-10 py-6 lg:px-16">
          {guide ? (
            <GuideReader guide={guide} />
          ) : (
            <p className="font-mono text-[11px] tracking-[0.08em] text-red-500 uppercase">
              No guide revision found to display.
            </p>
          )}
        </main>
      </section>
    </div>
  );
}
