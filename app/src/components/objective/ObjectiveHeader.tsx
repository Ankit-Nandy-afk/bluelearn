import { BookOpen, Calendar, Clock, User } from "lucide-react";

import type { Objective } from "@bluelearn/schemas";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/guideUtils";

type PropTypes = {
  objective: Pick<
    Objective,
    "title" | "summary" | "curator" | "created_at" | "tags"
  >;
  stats: {
    guides: number;
    durationMinutes: number;
  };
};

export const ObjectiveHeader = ({ objective, stats }: PropTypes) => {
  const created = new Date(objective.created_at);
  const createdLabel = Number.isNaN(created.getTime())
    ? objective.created_at
    : formatDate(created);

  return (
    <header className="mb-5">
      <h1 className="text-3xl font-bold">
        {objective.title ?? "Untitled objective"}
      </h1>

      <div className="mono-micro my-2 flex flex-wrap items-center gap-2.5 text-muted-foreground/80">
        {objective.curator && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground/75" />@
            {objective.curator}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground/75" />
          {createdLabel}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-muted-foreground/75" />
          {stats.guides} {stats.guides === 1 ? "guide" : "guides"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground/75" />
          {formatDuration(stats.durationMinutes)}
        </span>
      </div>

      {objective.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {objective.tags.map((tag) => (
            <Badge
              key={tag.slug}
              variant="outline"
              className="mono-micro rounded-full border bg-badge tracking-[0.08em] text-badge-foreground"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {objective.summary && (
        <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
          {objective.summary}
        </p>
      )}
    </header>
  );
};
