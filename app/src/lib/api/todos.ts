import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const todos = client.todos;

type FetchOptions = { signal?: AbortSignal };

export async function listTodos({ signal }: FetchOptions = {}) {
  const res = await todos.$get({}, { init: { signal } });
  await assertOk(res);

  const { todos: items } = await res.json();
  return items;
}
