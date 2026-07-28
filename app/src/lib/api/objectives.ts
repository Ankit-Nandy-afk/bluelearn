import { client } from "./apiClient";
import { assertOk } from "./apiHelpers";

type FetchOptions = { signal?: AbortSignal };

export async function listObjectives(
  { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
  { signal }: FetchOptions = {}
) {
  const res = await client.objectives.$get(
    { query: { page: String(page), limit: String(limit) } },
    { init: { signal } }
  );
  if (!res.ok) return assertOk(res) as Promise<never>;
  return res.json();
}
