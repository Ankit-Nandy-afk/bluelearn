import type { InferRequestType } from "hono/client";
import type { GuideListItem } from "@bluelearn/schemas";
import { client } from "@/lib/api/apiClient";
import { assertOk, collectAll } from "@/lib/api/apiHelpers";

const guides = client.guides;

type FetchOptions = { signal?: AbortSignal };

export async function listGuides({ signal }: FetchOptions = {}) {
  return collectAll<GuideListItem>(async (query) => {
    const res = await guides.$get({ query }, { init: { signal } });
    if (!res.ok) return assertOk(res) as Promise<never>;

    const { guides: items, total } = await res.json();
    return { items, total };
  });
}

export async function getGuide(slug: string, { signal }: FetchOptions = {}) {
  const res = await guides[":slug"].$get(
    { param: { slug } },
    { init: { signal } }
  );
  if (!res.ok) return assertOk(res) as Promise<never>;

  return res.json();
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
