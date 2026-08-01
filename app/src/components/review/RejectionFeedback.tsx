import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import type { PanelDecision } from "@/components/review/DecisionList";
import { DecisionList } from "@/components/review/DecisionList";
import { Button } from "@/components/ui/button";
import { getRevision } from "@/lib/api/guideRevisions";
import { getReviewCase } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

export const RejectionFeedback = ({ draftId }: { draftId: string }) => {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Array<PanelDecision>>([]);
  const [open, setOpen] = useState(true);

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
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Show panel feedback"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        className={cn(
          "absolute top-[39px] right-7 transition-opacity duration-150",
          open ? "pointer-events-none opacity-0" : "opacity-100 delay-250"
        )}
        onClick={() => setOpen(true)}
      >
        <PanelRightOpen className="size-5" />
      </Button>

      <div
        className={cn(
          "-mt-8 -mr-8 -mb-8 shrink-0 transition-[width] duration-400 ease-out [clip-path:inset(0)] lg:-mr-16",
          open ? "w-[320px] border-l" : "w-0"
        )}
      >
        <aside
          className={cn(
            "sticky top-[65px] max-h-[calc(100vh-65px)] w-[320px] space-y-4 overflow-y-auto px-6 pt-[39px] pb-8 transition-opacity",
            open
              ? "opacity-100 delay-200 duration-200"
              : "opacity-0 duration-150"
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
                Panel Feedback
              </p>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Hide panel feedback"
                className="-mr-1"
                onClick={() => setOpen(false)}
              >
                <PanelRightClose className="size-5" />
              </Button>
            </div>

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
    </>
  );
};
