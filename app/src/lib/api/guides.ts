import type { InferRequestType } from "hono/client";
import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const guides = client.guides;

type FetchOptions = { signal?: AbortSignal };

export async function listGuides({ signal }: FetchOptions = {}) {
  const res = await guides.$get(undefined, { init: { signal } });
  await assertOk(res);

  const { guides: data } = await res.json();
  return data;
}

export async function createGuide(
  body: InferRequestType<typeof guides.$post>["json"]
) {
  const res = await guides.$post({ json: body });
  if (!res.ok) return assertOk(res) as Promise<never>;

  const { revision_id } = await res.json();
  return revision_id;
}

export async function addGuideVariant(
  slug: string,
  body: InferRequestType<(typeof guides)[":slug"]["variants"]["$post"]>["json"]
) {
  const res = await guides[":slug"].variants.$post({
    param: { slug },
    json: body,
  });

  const result = await res.json();
  if ("revision_id" in result) {
    return result.revision_id;
  }

  throw new Error("Failed to submit guide variant.");
}
