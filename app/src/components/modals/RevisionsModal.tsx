import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GitCommit, Sparkles } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideRevisionListItem } from "@bluelearn/schemas";
import { Badge } from "@/components/ui/badge";
import { getVariantRevisions } from "@/lib/api/variants";
import { formatDate } from "@/lib/guideUtils";

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  variantSlug: string | null;
  variantId: string | null;
};

export const RevisionsModal = ({
  open,
  onOpenChange,
  slug,
  variantSlug,
  variantId,
}: PropsTypes) => {
  const [revisions, setRevisions] = useState<Array<GuideRevisionListItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !variantId) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    getVariantRevisions(variantId)
      .then((res) => {
        if (!ignore) {
          setRevisions(res.revisions);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load revisions", err);
          setError("Failed to load revisions. Please try again.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [open, variantId]);

  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Revision History"
      description="Chronological log of changes and published revisions for this guide."
      loading={loading}
      loadingText="Loading revisions..."
      error={error}
      isEmpty={revisions.length === 0}
      emptyIcon={<Sparkles className="h-6 w-6" />}
      emptyTitle="No revisions found"
      emptyDescription="This guide does not have any recorded revision history yet."
    >
      {revisions.map((rev, index) => {
        const displayDate = rev.approved_at || rev.created_at;
        const formattedDate = displayDate
          ? formatDate(new Date(displayDate))
          : "Unknown date";
        const isLatest = index === 0;

        const className = `relative flex w-full flex-col gap-1.5 rounded-lg border p-3.5 transition-colors hover:bg-muted ${
          isLatest ? "border-primary/50 bg-primary/5" : "border-border bg-card"
        }`;

        const content = (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GitCommit
                  className={`h-3.5 w-3.5 ${
                    isLatest ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="mono-micro text-muted-foreground">
                  {rev.id.slice(0, 8)}
                </span>
              </div>
              {isLatest && (
                <Badge
                  variant="outline"
                  className="mono-micro rounded-full border border-badge-border bg-badge tracking-[0.08em] text-badge-foreground"
                >
                  Latest
                </Badge>
              )}
            </div>

            <p className="text-xs font-bold text-foreground">
              {rev.change_summary || "Initial version or update"}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {rev.author && <span>by @{rev.author}</span>}
              {rev.author && <span>·</span>}
              <span>Updated {formattedDate}</span>
            </div>
          </>
        );

        return variantSlug ? (
          <Link
            key={rev.id}
            to="/guides/$slug/$variantSlug/revisions/$revisionId"
            params={{ slug, variantSlug, revisionId: rev.id }}
            onClick={() => onOpenChange(false)}
            className={className}
          >
            {content}
          </Link>
        ) : (
          <div key={rev.id} className={className}>
            {content}
          </div>
        );
      })}
    </BaseGuideModal>
  );
};
