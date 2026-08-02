import { useEffect, useState } from "react";
import { GitCommit, History, Loader2, Sparkles } from "lucide-react";
import type { GuideRevisionListItem } from "@bluelearn/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/guideUtils";
import { getGuideRevisions } from "@/lib/api/guides";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <DialogTitle>Revision History</DialogTitle>
          </div>
          <DialogDescription>
            Chronological log of changes and published revisions for this guide.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading revisions...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </div>
          ) : revisions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs font-medium text-foreground">
                No revisions found
              </p>
              <p className="mt-1 text-xs">
                This guide does not have any recorded revision history yet.
              </p>
            </div>
          ) : (
            revisions.map((rev, index) => {
              const displayDate = rev.approved_at || rev.created_at;
              const formattedDate = displayDate
                ? formatDate(new Date(displayDate))
                : "Unknown date";

              return (
                <div
                  key={rev.id}
                  className="relative flex flex-col gap-1.5 rounded-lg border p-3.5 transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GitCommit className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {rev.id.slice(0, 8)}
                      </span>
                      {index === 0 && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 text-[10px]"
                        >
                          Latest
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {formattedDate}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-foreground">
                    {rev.change_summary || "Initial version or update"}
                  </p>

                  {rev.author && (
                    <p className="text-[11px] text-muted-foreground">
                      by <span className="font-medium">@{rev.author}</span>
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
