import type { InferRequestType } from "hono/client";
import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const revisions = client["objective-revisions"];

type FetchOptions = { signal?: AbortSignal };

export async function getObjectiveRevision(
  id: string,
  { signal }: FetchOptions = {}
) {
  const res = await revisions[":id"].$get(
    { param: { id } },
    { init: { signal } }
  );
  await assertOk(res);

  return res.json();
}

export async function updateObjectiveRevision(
  id: string,
  body: InferRequestType<(typeof revisions)[":id"]["$patch"]>["json"]
) {
  const res = await revisions[":id"].$patch({ param: { id }, json: body });
  await assertOk(res);

  return res.json();
}

export async function submitObjectiveRevision(id: string) {
  const res = await revisions[":id"].publish.$post({ param: { id } });
  await assertOk(res);

  const { slug } = await res.json();
  return slug;
}

export async function addObjectiveTarget(
  id: string,
  guide_base_id: string,
  { signal }: FetchOptions = {}
) {
  const res = await revisions[":id"].targets.$post(
    { param: { id }, json: { guide_base_id } },
    { init: { signal } }
  );
  await assertOk(res);
  return res.json();
}

export async function removeObjectiveTarget(
  id: string,
  baseId: string,
  { signal }: FetchOptions = {}
) {
  const res = await revisions[":id"].targets[":baseId"].$delete(
    { param: { id, baseId } },
    { init: { signal } }
  );
  await assertOk(res);
  return res.json();
}
