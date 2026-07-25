import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const reviews = client.reviews;

type FetchOptions = { signal?: AbortSignal };

type QueueCase = {
  id: string;
  case_type: string;
  status: string;
  title: string | null;
  created_at: string;
  decision: "approved" | "rejected" | null;
};

export async function getReviewQueue({ signal }: FetchOptions = {}) {
  const res = await reviews.queue.$get({ query: {} }, { init: { signal } });
  await assertOk(res);

  const { cases } = (await res.json()) as { cases: Array<QueueCase> };
  return cases;
}

export async function getReviewCase(id: string, { signal }: FetchOptions = {}) {
  const res = await reviews.cases[":id"].$get(
    { param: { id } },
    { init: { signal } }
  );
  await assertOk(res);

  return await res.json();
}
