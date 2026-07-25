import { client } from "./apiClient";
import { assertOk } from "./apiHelpers";

export async function listObjectives({
  page = 1,
  limit = 20,
}: { page?: number; limit?: number } = {}) {
  const res = await client.objectives.$get({
    query: { page: String(page), limit: String(limit) },
  });
  await assertOk(res);
  return res.json() as Promise<{
    objectives: Array<{
      id: string;
      slug: string | null;
      title: string | null;
      summary: string | null;
      curator: string | null;
      created_at: string;
      guides_total: number;
      duration_minutes: number;
      featured_sub_objective: Array<{
        position: number;
        slug: string | null;
        title: string | null;
      }>;
    }>;
    total: number;
  }>;
}
