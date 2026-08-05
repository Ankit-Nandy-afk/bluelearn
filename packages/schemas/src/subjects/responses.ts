import { z } from "zod";

// A subject as listed/browsed. guides_total and objectives_total are aggregates
// counting the guides/objectives whose current revision carries the tag.
export const subjectListItemSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  summary: z.string().nullable(),
  guides_total: z.number().int(),
  objectives_total: z.number().int(),
});

export type SubjectListItem = z.infer<typeof subjectListItemSchema>;

// Subjects grouped by the first character of their name. Anything not
// starting with a letter lands in "#".
export const subjectGroupSchema = z.object({
  char: z.string(),
  subjects: z.array(subjectListItemSchema),
});

export type SubjectGroup = z.infer<typeof subjectGroupSchema>;
