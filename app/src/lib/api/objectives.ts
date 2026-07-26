import type { InferRequestType } from "hono/client";
import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const objectives = client.objectives;

type FetchOptions = { signal?: AbortSignal };

export async function listObjectives({ signal }: FetchOptions = {}) {
  const res = await (objectives.$get as any)({}, { init: { signal } });
  await assertOk(res);

  const data = await res.json();
  if ("objectives" in data) {
    return data.objectives;
  }
  return [];
}

export async function createObjective(
  body: InferRequestType<typeof objectives.$post>["json"]
) {
  const res = await objectives.$post({ json: body });
  if (!res.ok) return assertOk(res) as Promise<never>;

  const { revision_id } = await res.json();
  return revision_id;
}
