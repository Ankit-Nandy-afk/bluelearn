import { z } from "zod";
import { diffLineSchema, fieldDiffSchema, revisionRefSchema } from "../diff";
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
  guides_total: z.number().int(),
  duration_minutes: z.number().int(),
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

export const objectiveSnapshotNodeSchema = z.object({
  id: z.string(),
  guide_base_id: z.string(),
  guide_id: z.string(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  is_target: z.boolean(),
  is_included: z.boolean(),
  is_featured: z.boolean(),
  target_position: z.number().int().nullable(),
  note: z.string().nullable(),
});

export const objectiveSnapshotOrderSchema = z.object({
  target_node_id: z.string(),
  node_id: z.string(),
  position: z.number().int(),
});

export const objectiveSnapshotEdgeSchema = z.object({
  from_id: z.string(),
  to_id: z.string(),
});

export const objectiveSnapshotSchema = z.object({
  nodes: z.array(objectiveSnapshotNodeSchema),
  orders: z.array(objectiveSnapshotOrderSchema),
  projected_edges: z.array(objectiveSnapshotEdgeSchema),
  raw_edges: z.array(objectiveSnapshotEdgeSchema),
});

export const objectiveRevisionListItemSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  change_summary: z.string().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  created_at: z.string(),
  published_at: z.string().nullable(),
  author: z.string().nullable(),
});

export const objectiveNodeChangeSchema = z.object({
  from: objectiveSnapshotNodeSchema,
  to: objectiveSnapshotNodeSchema,
});

// How one sub-objective's linear sequence changed between two revisions.
// `lines` is the sequence read top to bottom, with each step marked as kept,
// added or removed — a guide that moved shows up as both. `changed` carries
// the per-step field edits (variant, note, skipped...) that reordering alone
// cannot express, so a step can be unchanged in `lines` yet listed here.
export const objectiveTargetDiffSchema = z.object({
  guide_base_id: z.string(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  status: z.enum(["added", "removed", "changed", "unchanged"]),
  lines: z.array(diffLineSchema),
  changed: z.array(objectiveNodeChangeSchema),
});

export const objectiveRevisionDiffSchema = z.object({
  from: revisionRefSchema,
  to: revisionRefSchema,
  fields: z.object({
    title: fieldDiffSchema,
    summary: fieldDiffSchema,
  }),
  // In the curator's own order on the `to` revision, with sub-objectives that
  // only exist on `from` appended.
  targets: z.array(objectiveTargetDiffSchema),
});

export type ObjectiveSnapshotNode = z.infer<typeof objectiveSnapshotNodeSchema>;
export type ObjectiveSnapshotOrder = z.infer<
  typeof objectiveSnapshotOrderSchema
>;
export type ObjectiveSnapshotEdge = z.infer<typeof objectiveSnapshotEdgeSchema>;
export type ObjectiveSnapshot = z.infer<typeof objectiveSnapshotSchema>;
export type ObjectiveRevisionListItem = z.infer<
  typeof objectiveRevisionListItemSchema
>;
export type ObjectiveNodeChange = z.infer<typeof objectiveNodeChangeSchema>;
export type ObjectiveTargetDiff = z.infer<typeof objectiveTargetDiffSchema>;
export type ObjectiveRevisionDiff = z.infer<typeof objectiveRevisionDiffSchema>;

export type ObjectiveNode = z.infer<typeof objectiveNodeSchema>;
export type ObjectiveEdge = z.infer<typeof objectiveEdgeSchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type FeaturedNode = z.infer<typeof featuredNodeSchema>;
export type ObjectiveListItem = z.infer<typeof objectiveListItemSchema>;
