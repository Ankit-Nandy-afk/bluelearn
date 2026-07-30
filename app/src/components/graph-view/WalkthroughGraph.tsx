import { useCallback, useEffect, useRef } from "react";
import { Background, Controls, Panel, ReactFlow } from "@xyflow/react";
import { Fullscreen, Minimize } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { WalkthroughNode as WalkthroughNodeComponent } from "./WalkthroughNode";
import { useGraphLayout } from "./useGraphLayout";
import type { Node, ReactFlowInstance } from "@xyflow/react";
import type { Walkthrough } from "@bluelearn/schemas";
import { Button } from "@/components/ui/button";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  walkthroughNode: WalkthroughNodeComponent,
};

const NODE_WIDTH = 420;
const NODE_SPACING = 480;

type WalkthroughGraphProps = {
  walkthroughData: Walkthrough;
  targetSlug: string;
  hoveredGuide: string | null;
  onHoverGuide: (slug: string | null) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
};

export function WalkthroughGraph({
  walkthroughData,
  targetSlug,
  hoveredGuide,
  onHoverGuide,
  isFullscreen,
  onToggleFullscreen,
}: WalkthroughGraphProps) {
  const navigate = useNavigate();

  const { nodes, edges, onNodesChange, onEdgesChange } = useGraphLayout({
    walkthroughData,
    targetSlug,
    hoveredGuide,
    nodeType: "walkthroughNode",
    nodeWidth: NODE_WIDTH,
    nodeSpacing: NODE_SPACING,
  });

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      navigate({ to: `/guides/${node.id}` });
    },
    [navigate]
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

  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (reactFlowInstance.current) {
      setTimeout(() => {
        reactFlowInstance.current?.fitView({ duration: 300 });
      }, 50);
    }
  }, [isFullscreen]);

  return (
    <div className="relative h-full min-h-[500px] w-full">
      <ReactFlow
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
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

        {onToggleFullscreen && (
          <Panel position="top-right" className="m-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-8 w-8 border-border/50 bg-background/80 shadow-sm backdrop-blur-md"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize /> : <Fullscreen />}
            </Button>
          </Panel>
        )}

        <Controls
          showInteractive={false}
          className="overflow-hidden rounded-xl border-border! bg-background! shadow-md! [&>button]:border-b-border! [&>button]:text-foreground! hover:[&>button]:bg-muted!"
        />
      </ReactFlow>
    </div>
  );
}
