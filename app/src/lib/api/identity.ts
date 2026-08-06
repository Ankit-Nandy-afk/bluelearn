import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const me = client.me;

type FetchOptions = { signal?: AbortSignal };

export async function getMyIdentity({ signal }: FetchOptions = {}) {
  const res = await me.$get(undefined, { init: { signal } });
  await assertOk(res);

  return await res.json();
}

export async function deleteMyAccount() {
  const res = await me.$delete();
  await assertOk(res);
}

export async function getMyStats({ signal }: FetchOptions = {}) {
  const res = await me.stats.$get(undefined, { init: { signal } });
  await assertOk(res);

  return await res.json();
}

export async function getMyActivity({ signal }: FetchOptions = {}) {
  const res = await me.activity.$get(undefined, { init: { signal } });
  await assertOk(res);

  return await res.json();
}

export async function getPublicProfile(
  username: string,
  { signal }: FetchOptions = {}
) {
  const res = await client.profiles[":username"].$get(
    { param: { username } },
    { init: { signal } }
  );
  await assertOk(res);

  return await res.json();
}
