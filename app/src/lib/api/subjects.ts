import type {
  GuideListItem,
  ObjectiveListItem,
  SubjectListItem,
} from "@bluelearn/schemas";
import { client } from "@/lib/api/apiClient";
import { assertOk } from "@/lib/api/apiHelpers";

const subjects = client.subjects;

type FetchOptions = { signal?: AbortSignal };

export async function listSubjects({ signal }: FetchOptions = {}) {
  const res = await subjects.$get({ query: {} }, { init: { signal } });
  await assertOk(res);

  const { subjects: data } = (await res.json()) as {
    subjects: Array<SubjectListItem>;
  };
  return data;
}

export async function getSubjectBySlug(
  slug: string,
  { signal }: FetchOptions = {}
) {
  const res = await subjects[":slug"].$get(
    { param: { slug } },
    { init: { signal } }
  );
  await assertOk(res);

  const { subject } = await res.json();
  return subject;
}

export async function listSubjectGuides(
  slug: string,
  { signal }: FetchOptions = {}
) {
  const res = await subjects[":slug"].guides.$get(
    { query: {}, param: { slug } },
    { init: { signal } }
  );
  await assertOk(res);

  const { guides } = (await res.json()) as { guides: Array<GuideListItem> };
  return guides;
}

export async function listSubjectObjectives(
  slug: string,
  { signal }: FetchOptions = {}
) {
  const res = await subjects[":slug"].objectives.$get(
    { query: {}, param: { slug } },
    { init: { signal } }
  );
  await assertOk(res);

  const { objectives } = (await res.json()) as {
    objectives: Array<ObjectiveListItem>;
  };
  return objectives;
}
