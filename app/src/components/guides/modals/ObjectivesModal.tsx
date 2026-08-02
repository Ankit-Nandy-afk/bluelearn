import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, Target } from "lucide-react";
import type { GuideObjectiveListItem } from "@bluelearn/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getGuideObjectives } from "@/lib/api/guides";

type ObjectivesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
};

export function ObjectivesModal({
  open,
  onOpenChange,
  slug,
}: ObjectivesModalProps) {
  const [objectives, setObjectives] = useState<Array<GuideObjectiveListItem>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    getGuideObjectives(slug)
      .then((res) => {
        if (!ignore) {
          setObjectives(res.objectives);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load objectives", err);
          setError("Failed to load objectives. Please try again.");
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
            <Target className="h-4 w-4 text-primary" />
            <DialogTitle>Included in Objectives</DialogTitle>
          </div>
          <DialogDescription>
            Curated learning paths and educational objectives that feature this
            guide.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading objectives...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </div>
          ) : objectives.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              <Target className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs font-medium text-foreground">
                No objectives found
              </p>
              <p className="mt-1 text-xs">
                This guide is not yet part of any curated objectives.
              </p>
              <div className="mt-4">
                <Link
                  to="/objectives"
                  className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80"
                  onClick={() => onOpenChange(false)}
                >
                  Explore all objectives
                </Link>
              </div>
            </div>
          ) : (
            objectives.map((objective) => (
              <Link
                key={objective.id || objective.slug}
                to="/objectives/$slug"
                params={{ slug: objective.slug }}
                onClick={() => onOpenChange(false)}
                className="group relative flex flex-col gap-1.5 rounded-lg border p-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-medium text-foreground group-hover:text-primary">
                    {objective.title}
                  </h4>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                {objective.summary && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {objective.summary}
                  </p>
                )}
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
