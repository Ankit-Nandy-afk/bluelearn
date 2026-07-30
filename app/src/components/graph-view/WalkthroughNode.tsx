import { Handle, Position } from "@xyflow/react";
import type { GraphNodeData } from "./useGraphLayout";
import { Card, CardHeader } from "@/components/ui/card";

// isSelected comes from WalkthroughGraph's getNodeState.
type WalkthroughNodeData = GraphNodeData & { isSelected: boolean };

export function WalkthroughNode({ data }: { data: WalkthroughNodeData }) {
  const {
    isTarget,
    title,
    duration_minutes,
    level,
    isHovered,
    isDimmed,
    isSelected,
  } = data;

  // The target inverts, so its dividers and labels ride on the fill instead of
  // the page.
  const divider = isTarget ? "border-white/25" : "border-border";
  const label = isTarget ? "text-white/70" : "text-muted-foreground";

  return (
    <div
      className={`relative w-max min-w-[260px] cursor-pointer transition-opacity duration-150 select-none ${
        isDimmed ? "opacity-30" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="-top-1 h-2 w-8 rounded-full !border-none !bg-primary/40"
      />

      <Card
        className={`group relative gap-0 rounded-md border py-0 ring-0 transition-colors ${
          isTarget
            ? isHovered
              ? "bg-brand-dk-blue/90 text-white"
              : "bg-brand-dk-blue text-white"
            : isHovered || isSelected
              ? "bg-muted"
              : "bg-background"
        } border-foreground`}
      >
        <CardHeader className="[container-type:normal] gap-1 py-3.5">
          <p className={`mono-micro ${label}`}>
            {isTarget ? "Target Guide" : "Guide"}
          </p>
          <h3 className="text-lg font-semibold tracking-tight whitespace-nowrap">
            {title}
          </h3>
        </CardHeader>

        <div className={`grid grid-cols-2 border-t ${divider}`}>
          <div className={`border-r px-4 py-2.5 ${divider}`}>
            <p className={`mono-micro ${label}`}>Level</p>
            <p className="text-sm font-semibold">{level}</p>
          </div>
          <div className="px-4 py-2.5">
            <p className={`mono-micro ${label}`}>Duration</p>
            <p className="text-sm font-semibold">
              {duration_minutes > 0 ? `${duration_minutes} min` : "--"}
            </p>
          </div>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="-bottom-1 h-2 w-8 rounded-full !border-none !bg-primary/40"
      />
    </div>
  );
}
