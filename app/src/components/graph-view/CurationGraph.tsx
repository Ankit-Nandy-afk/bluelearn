import { useCallback, useRef } from "react";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import { CurationNode } from "./CurationNode";
import { useGraphLayout } from "./useGraphLayout";
import type { Node } from "@xyflow/react";
import type { Walkthrough } from "@bluelearn/schemas";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  curationNode: CurationNode,
};

const NODE_WIDTH = 350;
const NODE_SPACING = 380;

type CurationGraphProps = {
  walkthroughData: Walkthrough;
  curatedSequence: Array<string>;
  targetSlug: string;
  onToggleGuide: (slug: string, isChecked: boolean) => void;
  hoveredGuide: string | null;
  onHoverGuide: (slug: string | null) => void;
};

export function CurationGraph({
  walkthroughData,
  curatedSequence,
  targetSlug,
  onToggleGuide,
  hoveredGuide,
  onHoverGuide,
}: CurationGraphProps) {
  const getNodeState = useCallback(
    (slug: string) => {
      const selectedOrder = curatedSequence.indexOf(slug);
      return {
        isChecked: slug === targetSlug || selectedOrder !== -1,
        selectedOrder: selectedOrder !== -1 ? selectedOrder + 1 : null,
      };
    },
    [curatedSequence, targetSlug]
  );

  const { nodes, edges, onNodesChange, onEdgesChange } = useGraphLayout({
    walkthroughData,
    targetSlug,
    hoveredGuide,
    nodeType: "curationNode",
    nodeWidth: NODE_WIDTH,
    nodeSpacing: NODE_SPACING,
    getNodeState,
  });

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id === targetSlug) return;
      const isCurrentlyChecked = curatedSequence.includes(node.id);
      onToggleGuide(node.id, !isCurrentlyChecked);
    },
    [curatedSequence, targetSlug, onToggleGuide]
  );

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node) => {
      clearTimeout(hoverTimeoutRef.current);
      onHoverGuide(node.id);
    },
    [onHoverGuide]
  );

  const handleNodeMouseLeave = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      onHoverGuide(null);
    }, 50);
  }, [onHoverGuide]);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        key={targetSlug}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        className="bg-transparent"
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background
          color="hsl(var(--muted-foreground) / 0.2)"
          gap={24}
          size={2}
        />
        <Controls
          showInteractive={false}
          className="overflow-hidden rounded-xl border-border! bg-background! shadow-md! [&>button]:border-b-border! [&>button]:text-foreground! hover:[&>button]:bg-muted!"
        />
      </ReactFlow>
    </div>
  );
}
