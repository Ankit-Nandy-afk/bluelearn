import { createFileRoute, useNavigate } from "@tanstack/react-router";

import type { ContributionType } from "@/types/contributions";
import ContributionFlow from "@/components/contribute/ContributionFlow";
import { requireSession } from "@/lib/auth";
import { RejectionFeedback } from "@/components/review/RejectionFeedback";

export type ContributeSearch = {
  draft?: string;
  kind?: "guide" | "objective";
  type?: ContributionType;
  step?: string;
};

export const Route = createFileRoute("/contribute")({
  ssr: false,
  beforeLoad: requireSession,
  validateSearch: (search: Record<string, unknown>): ContributeSearch => {
    const draft = typeof search.draft === "string" ? search.draft : undefined;
    const kind =
      search.kind === "objective" || search.kind === "guide"
        ? search.kind
        : undefined;
    const type =
      search.type === "guide" ||
      search.type === "variant" ||
      search.type === "objective"
        ? search.type
        : undefined;
    const step = typeof search.step === "string" ? search.step : undefined;

    return {
      draft,
      kind,
      type,
      step,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { draft, kind, type, step } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const handleTypeChange = (newType: ContributionType) => {
    navigate({
      search: (prev) => ({
        ...prev,
        type: newType,
        // Set the initial step for the selected contribution type
        step:
          newType === "guide"
            ? "guide-details"
            : newType === "variant"
              ? "variant-details"
              : "objective-details",
      }),
      replace: true,
    });
  };

  const handleStepChange = (newStep: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        step: newStep === "type" ? undefined : newStep,
        type: newStep === "type" ? undefined : prev.type,
        draft: newStep === "type" ? undefined : prev.draft,
        kind: newStep === "type" ? undefined : prev.kind,
      }),
      replace: true,
    });
  };

  return (
    <div className="mx-auto flex min-h-[max(calc(100vh-65px),750px)] w-full max-w-[1280px] flex-col border-x bg-background">
      <section className="relative flex min-h-0 flex-1 gap-8 border-b px-8 py-8 lg:px-16">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ContributionFlow
            type={type ?? null}
            setType={handleTypeChange}
            step={step}
            onStepChange={handleStepChange}
            draftId={draft}
            draftKind={kind}
          />
        </div>
        {draft && <RejectionFeedback draftId={draft} />}
      </section>
    </div>
  );
}
