import { z } from "zod";
import { subjectReferenceSchema } from "../subjects";
import { guideReferenceSchema } from "../guides/references";

export const objectiveNodeSchema = z.object({
  guide: guideReferenceSchema,
  level: z.number().int(),
  is_target: z.boolean(),
  is_included: z.boolean(),
  note: z.string().nullable(),
  word_count: z.number().int(),
});

// A prerequisite edge between two nodes.
export const objectiveEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const objectiveSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  curator: z.string().nullable(),
  created_at: z.iso.datetime(),
  tags: z.array(subjectReferenceSchema),
  current_revision_id: z.uuid().nullable(),
});

// Represents a guide the curator placed under the featured target.
export const featuredNodeSchema = z.object({
  position: z.number().int(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
});

// An objective as listed anywhere it renders as a card (GET /objectives,
// subject pages). duration_minutes sums the included guides' reading time.
export const objectiveListItemSchema = z.object({
  id: z.uuid(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  curator: z.string().nullable(),
  created_at: z.iso.datetime(),
  guides_total: z.number().int(),
  duration_minutes: z.number().int(),
  featured_sub_objective: z.array(featuredNodeSchema),
});

export type ObjectiveNode = z.infer<typeof objectiveNodeSchema>;
export type ObjectiveEdge = z.infer<typeof objectiveEdgeSchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type FeaturedNode = z.infer<typeof featuredNodeSchema>;
export type ObjectiveListItem = z.infer<typeof objectiveListItemSchema>;
