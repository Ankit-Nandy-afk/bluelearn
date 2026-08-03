import { useEffect, useState } from "react";
import { GitCommit, History, Sparkles } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideRevisionListItem } from "@bluelearn/schemas";
import { Badge } from "@/components/ui/badge";
import { getGuideRevisions } from "@/lib/api/guides";
import { formatDate } from "@/lib/guideUtils";

type RevisionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
};

export function RevisionsModal({
  open,
  onOpenChange,
  slug,
}: RevisionsModalProps) {
  const [revisions, setRevisions] = useState<Array<GuideRevisionListItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    getGuideRevisions(slug)
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
  }, [open, slug]);

  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Revision History"
      description="Chronological log of changes and published revisions for this guide."
      icon={<History className="h-4 w-4 text-primary" />}
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

        return (
          <div
            key={rev.id}
            className={`relative flex w-full flex-col gap-1.5 rounded-lg border p-3.5 transition-colors hover:bg-muted ${
              isLatest
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
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
                {isLatest && (
                  <Badge
                    variant="outline"
                    className="mono-micro rounded-full border border-badge-border bg-badge tracking-[0.08em] text-badge-foreground"
                  >
                    Latest
                  </Badge>
                )}
              </div>
              <span className="mono-micro text-muted-foreground/80">
                {formattedDate}
              </span>
            </div>

            <p className="text-xs font-medium text-foreground">
              {rev.change_summary || "Initial version or update"}
            </p>

            {rev.author && (
              <p className="mono-micro text-muted-foreground">
                by @{rev.author}
              </p>
            )}
          </div>
        );
      })}
    </BaseGuideModal>
  );
}
