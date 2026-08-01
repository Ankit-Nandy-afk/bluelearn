import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import type { PanelDecision } from "@/components/review/DecisionList";
import { DecisionList } from "@/components/review/DecisionList";
import { getRevision } from "@/lib/api/guideRevisions";
import { getReviewCase } from "@/lib/api/reviews";

export const RejectionFeedback = ({ draftId }: { draftId: string }) => {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Array<PanelDecision>>([]);

  useEffect(() => {
    const controller = new AbortController();
    const opts = { signal: controller.signal };

    getRevision(draftId, opts)
      .then(({ revised_from_case_id }) => {
        if (!revised_from_case_id) return;
        return getReviewCase(revised_from_case_id, opts).then((data) => {
          setCaseId(revised_from_case_id);
          setDecisions(data.decisions);
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, [draftId]);

  if (!caseId) return null;

  return (
    <div className="-mt-8 -mr-8 -mb-8 w-[320px] shrink-0 border-l lg:-mr-16">
      <aside className="sticky top-[65px] max-h-[calc(100vh-65px)] space-y-4 overflow-y-auto px-6 py-8">
        <div className="space-y-1">
          <p className="font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            Panel Feedback
          </p>
          <Link
            to="/review/$caseId"
            params={{ caseId }}
            className="mono-micro text-muted-foreground underline-offset-4 hover:underline"
          >
            View the closed case
          </Link>
        </div>

        <DecisionList decisions={decisions} />
      </aside>
    </div>
  );
};
