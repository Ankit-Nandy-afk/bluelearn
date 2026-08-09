import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Target } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideObjectiveListItem } from "@bluelearn/schemas";
import { getGuideObjectives } from "@/lib/api/guides";
import { formatDate } from "@/lib/guideUtils";

type PropsTypes = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
};

export const ObjectivesModal = ({ open, onOpenChange, slug }: PropsTypes) => {
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
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Included in Objectives"
      description="Curated learning paths and educational objectives that feature this guide."
      loading={loading}
      loadingText="Loading objectives..."
      error={error}
      isEmpty={objectives.length === 0}
      emptyIcon={<Target className="h-6 w-6" />}
      emptyTitle="No objectives found"
      emptyDescription="This guide is not yet part of any curated objectives."
      emptyAction={
        <Link
          to="/objectives"
          className="btn-outline text-xs"
          onClick={() => onOpenChange(false)}
        >
          Explore all objectives
        </Link>
      }
    >
      {objectives.map((objective) => (
        <Link
          key={objective.id || objective.slug}
          to="/objectives/$slug"
          params={{ slug: objective.slug }}
          onClick={() => onOpenChange(false)}
          className="group relative flex w-full flex-col gap-1.5 rounded-lg border border-border bg-card p-3.5 transition-colors hover:bg-muted"
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-foreground">
              {objective.title}
            </h4>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          {objective.summary && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {objective.summary}
            </p>
          )}

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {objective.author && <span>by @{objective.author}</span>}
            {objective.author && objective.updated_at && <span>·</span>}
            {objective.updated_at && (
              <span>Updated {formatDate(new Date(objective.updated_at))}</span>
            )}
          </div>
        </Link>
      ))}
    </BaseGuideModal>
  );
};
