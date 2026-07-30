import { useCallback, useEffect, useRef } from "react";
import {
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { Fullscreen, Minimize } from "lucide-react";
import { WalkthroughNode as WalkthroughNodeComponent } from "./WalkthroughNode";
import { useGraphLayout } from "./useGraphLayout";
import type { Node } from "@xyflow/react";
import type { Walkthrough } from "@bluelearn/schemas";
import { Button } from "@/components/ui/button";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  walkthroughNode: WalkthroughNodeComponent,
};

const NODE_WIDTH = 320;
const NODE_SPACING = 560;

type WalkthroughGraphProps = {
  walkthroughData: Walkthrough;
  targetSlug: string;
  hoveredGuide: string | null;
  onHoverGuide: (slug: string | null) => void;
  selectedGuide: string;
  onSelectGuide: (slug: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
};

// The provider hoists the xyflow store above the graph, so fitView is callable
// from the first render instead of waiting on onInit.
export function WalkthroughGraph(props: WalkthroughGraphProps) {
  return (
    <ReactFlowProvider>
      <Graph {...props} />
    </ReactFlowProvider>
  );
}

function Graph({
  walkthroughData,
  targetSlug,
  hoveredGuide,
  onHoverGuide,
  selectedGuide,
  onSelectGuide,
  isFullscreen,
  onToggleFullscreen,
}: WalkthroughGraphProps) {
  const getNodeState = useCallback(
    (slug: string) => ({ isSelected: slug === selectedGuide }),
    [selectedGuide]
  );

  const { nodes, edges, onNodesChange, onEdgesChange, isLayoutSettled } =
    useGraphLayout({
      walkthroughData,
      targetSlug,
      hoveredGuide,
      nodeType: "walkthroughNode",
      nodeWidth: NODE_WIDTH,
      nodeSpacing: NODE_SPACING,
      targetAtBottom: true,
      getNodeState,
    });

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectGuide(node.id);
    },
    [onSelectGuide]
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

  const { fitView } = useReactFlow();
  const layoutSignature = isLayoutSettled
    ? nodes.map((n) => `${n.id}:${n.position.x}:${n.measured?.width}`).join("|")
    : null;

  useEffect(() => {
    if (!layoutSignature) return;

    void fitView();
  }, [layoutSignature, fitView]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fitView({ duration: 300 });
    }, 50);

    return () => clearTimeout(timeout);
  }, [isFullscreen, fitView]);

  return (
    <div
      className={`relative h-full min-h-[500px] w-full transition-opacity duration-150 ${
        layoutSignature ? "opacity-100" : "opacity-0"
      }`}
    >
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
        proOptions={{ hideAttribution: true }}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        className="bg-transparent"
        minZoom={0.2}
        maxZoom={1.5}
      >
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
          position="bottom-right"
          showInteractive={false}
          className="overflow-hidden rounded-sm border! border-foreground! bg-background! shadow-none! [&_svg]:max-h-[15px]! [&_svg]:max-w-[15px]! [&>button]:h-8! [&>button]:w-8! [&>button]:border-b-foreground! [&>button]:p-2! [&>button]:text-foreground! [&>button:hover]:bg-muted!"
        />
      </ReactFlow>
    </div>
  );
}
