import { client } from "@/lib/api/apiClient";

export type GraphNode = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  level: number;
  word_count: number;
  tags: Array<{ slug: string; name: string }>;
  is_target: boolean;
  curated_position?: number;
};

export type GraphEdge = {
  from_id: string;
  to_id: string;
};

export type GraphData = {
  nodes: Array<GraphNode>;
  edges: Array<GraphEdge>;
};

export const fetchWalkthrough = async (
  targetSlug: string
): Promise<GraphData> => {
  const res = await client.guides[":slug"].walkthrough.$get({
    param: { slug: targetSlug },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch walkthrough");
  }

  const data = await res.json();
  return {
    ...data,
    nodes: data.nodes.map((node) => ({
      ...node,
      is_target: node.slug === targetSlug,
    })),
  };
};
