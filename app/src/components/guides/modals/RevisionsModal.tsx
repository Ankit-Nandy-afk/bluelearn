import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GitCommit, Sparkles } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { LinkProps } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/guideUtils";

export type RevisionEntry = {
  id: string;
  change_summary: string | null;
  author: string | null;
  date: string | null;
};

type RevisionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchRevisions: () => Promise<Array<RevisionEntry>>;
  linkTo?: (revision: RevisionEntry) => LinkProps | null;
  enabled?: boolean;
  title?: string;
  description?: string;
  emptyDescription?: string;
};

export function RevisionsModal({
  open,
  onOpenChange,
  fetchRevisions,
  linkTo,
  enabled = true,
  title = "Revision History",
  description = "Chronological log of changes and published revisions for this guide.",
  emptyDescription = "This guide does not have any recorded revision history yet.",
}: RevisionsModalProps) {
  const [revisions, setRevisions] = useState<Array<RevisionEntry>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRef = useRef(fetchRevisions);
  fetchRef.current = fetchRevisions;

  useEffect(() => {
    if (!open || !enabled) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    fetchRef
      .current()
      .then((res) => {
        if (!ignore) {
          setRevisions(res);
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
  }, [open, enabled]);

  return (
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      loading={loading}
      loadingText="Loading revisions..."
      error={error}
      isEmpty={revisions.length === 0}
      emptyIcon={<Sparkles className="h-6 w-6" />}
      emptyTitle="No revisions found"
      emptyDescription={emptyDescription}
    >
      {revisions.map((rev, index) => {
        const formattedDate = rev.date
          ? formatDate(new Date(rev.date))
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

        const link = linkTo?.(rev) ?? null;

        return link ? (
          <Link
            key={rev.id}
            {...link}
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
}
