import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const objectives = client.objectives;

type FetchOptions = { signal?: AbortSignal };

export async function listObjectives(
  { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
  { signal }: FetchOptions = {}
) {
  const res = await objectives.$get(
    { query: { page: String(page), limit: String(limit) } },
    { init: { signal } }
  );
  if (!res.ok) return assertOk(res) as Promise<never>;

  return res.json();
}
