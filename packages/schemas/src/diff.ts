import { z } from "zod";

export const diffLineSchema = z.object({
  type: z.enum(["unchanged", "added", "removed"]),
  text: z.string(),
});

export const fieldDiffSchema = z.object({
  changed: z.boolean(),
  diff: z.string().nullable().optional(),
  lines: z.array(diffLineSchema).nullable().optional(),
});

export const revisionRefSchema = z.object({
  id: z.string(),
  created_at: z.string(),
});

export type DiffLine = z.infer<typeof diffLineSchema>;
export type FieldDiff = z.infer<typeof fieldDiffSchema>;
export type RevisionRef = z.infer<typeof revisionRefSchema>;
