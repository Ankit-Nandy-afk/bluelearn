import { Handle, Position } from "@xyflow/react";
import { Clock, Network } from "lucide-react";
import type { GraphNodeData } from "./useGraphLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// isSelected comes from WalkthroughGraph's getNodeState.
type WalkthroughNodeData = GraphNodeData & { isSelected: boolean };

export function WalkthroughNode({ data }: { data: WalkthroughNodeData }) {
  const {
    isTarget,
    title,
    summary,
    duration_minutes,
    tags,
    level,
    isHovered,
    isDimmed,
    isSelected,
  } = data;

  return (
    <div
      className={`relative max-w-[420px] min-w-[380px] cursor-pointer transition-all duration-150 select-none ${
        isHovered ? "z-10 scale-[1.02]" : ""
      } ${isDimmed ? "opacity-30" : ""}`}
    >
      <Handle
        type="source"
        position={Position.Top}
        className="-top-1 h-2 w-8 rounded-full !border-none !bg-primary/40"
      />

      <Card
        className={`group relative rounded-md border bg-background ring-0 transition-colors hover:bg-muted ${
          isSelected
            ? "border-primary"
            : isHovered
              ? "border-primary/70"
              : "border-foreground"
        }`}
      >
        {/* Header */}
        <CardHeader className="relative p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
              Guide
            </p>
            {isTarget && (
              <Badge
                variant="outline"
                className="mono-micro rounded-full border border-badge-border bg-badge tracking-[0.08em] text-badge-foreground"
              >
                Target
              </Badge>
            )}
          </div>

          <h3 className="line-clamp-2 text-base font-semibold tracking-tight">
            {title}
          </h3>

          <div className="flex items-center gap-3 pt-1.5 text-xs">
            {duration_minutes > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {duration_minutes} min
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Network className="h-3 w-3" />
              Level {level}
            </div>
          </div>
        </CardHeader>

        {/* Metadata */}
        {(summary || tags.length > 0) && (
          <CardContent className="border-t border-foreground p-3">
            {summary && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {summary}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.slug}
                    variant="outline"
                    className="mono-micro rounded-full border border-badge-border bg-badge tracking-[0.08em] text-badge-foreground"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Handle
        type="target"
        position={Position.Bottom}
        className="-bottom-1 h-2 w-8 rounded-full !border-none !bg-primary/40"
      />
    </div>
  );
}
