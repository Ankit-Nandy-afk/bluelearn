import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import type { ContributionType } from "@/types/contributions";
import ContributionFlow from "@/components/contribute/ContributionFlow";
import { RejectionFeedback } from "@/components/review/RejectionFeedback";
import { requireSession } from "@/lib/auth";

export const Route = createFileRoute("/contribute")({
  ssr: false,
  beforeLoad: requireSession,
  validateSearch: (
    search: Record<string, unknown>
  ): {
    draft?: string;
    kind?: "guide" | "objective";
    source?: string;
    edit?: string;
  } => ({
    draft: typeof search.draft === "string" ? search.draft : undefined,
    kind: search.kind === "objective" ? "objective" : undefined,
    source: typeof search.source === "string" ? search.source : undefined,
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { draft, kind, source, edit } = Route.useSearch();
  const [type, setType] = useState<ContributionType | null>(
    edit || kind === "objective" ? "objective" : null
  );

  return (
    <div className="mx-auto flex min-h-[max(calc(100vh-65px),750px)] w-full max-w-[1280px] flex-col border-x bg-background">
      <section className="relative flex min-h-0 flex-1 gap-8 border-b px-8 py-8 lg:px-16">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ContributionFlow
            type={type}
            setType={setType}
            draftId={draft}
            draftKind={kind}
            sourceRevisionId={source}
            editSlug={edit}
          />
        </div>

        {draft && <RejectionFeedback draftId={draft} />}
      </section>
    </div>
  );
}
