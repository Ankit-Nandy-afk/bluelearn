import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Target } from "lucide-react";
import { BaseGuideModal } from "./BaseGuideModal";
import type { GuideObjectiveListItem } from "@bluelearn/schemas";
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
    <BaseGuideModal
      open={open}
      onOpenChange={onOpenChange}
      title="Included in Objectives"
      description="Curated learning paths and educational objectives that feature this guide."
      icon={<Target className="h-4 w-4 text-primary" />}
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
          className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80"
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
          className="group relative flex w-full flex-col gap-1.5 rounded-lg border p-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
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
      ))}
    </BaseGuideModal>
  );
}
