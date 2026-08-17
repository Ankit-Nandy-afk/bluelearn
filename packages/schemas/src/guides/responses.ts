import { z } from "zod";
import { subjectReferenceSchema } from "../subjects";
import { contributorSchema } from "../identity/responses";
import { guideStatusSchema, knowledgeTypeSchema } from "./enums";
import { guideReferenceSchema } from "./references";
export const guideSchema = z.object({
  slug: z.string(),
  variant_id: z.string().nullable(),
  variant_slug: z.string().nullable(),
  title: z.string(),
  author: z.string().nullable(),
  summary: z.string().nullable(),
  body: z.string().nullable(),
  duration_minutes: z.number().int(),
  created_at: z.iso.datetime(),
  tags: z.array(subjectReferenceSchema),
  prerequisites: z.array(guideReferenceSchema),
});
export const walkthroughSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.uuid(),
      slug: z.string(),
      title: z.string(),
      summary: z.string().nullable(),
      level: z.number().int(),
      duration_minutes: z.number().int(),
      tags: z.array(subjectReferenceSchema),
    })
  ),
  edges: z.array(
    z.object({
      from_id: z.uuid(),
      to_id: z.uuid(),
    })
  ),
});
export const guideListItemSchema = z.object({
  id: z.uuid(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  knowledge_type: knowledgeTypeSchema,
  summary: z.string().nullable(),
  status: guideStatusSchema,
  created_at: z.iso.datetime(),
  author: z.string().nullable(),
  duration_minutes: z.number().int(),
  tags: z.array(subjectReferenceSchema),
});
export type Guide = z.infer<typeof guideSchema>;
export type GuideListItem = z.infer<typeof guideListItemSchema>;
export type Walkthrough = z.infer<typeof walkthroughSchema>;
export const guideVariantListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  is_canonical: z.boolean(),
  author: z.string().nullable(),
  updated_at: z.string().nullable(),
  votes: z.object({ up: z.number(), down: z.number() }),
});
export type GuideVariantListItem = z.infer<typeof guideVariantListItemSchema>;
export const guideObjectiveListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  author: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export type GuideObjectiveListItem = z.infer<
  typeof guideObjectiveListItemSchema
>;
export const guideContributorSchema = contributorSchema;
export type GuideContributor = z.infer<typeof guideContributorSchema>;
export const guideRevisionListItemSchema = z.object({
  id: z.string(),
  status: z.literal("approved"),
  change_summary: z.string().nullable(),
  created_at: z.string(),
  approved_at: z.string().nullable(),
  author: z.string().nullable(),
});
export type GuideRevisionListItem = z.infer<typeof guideRevisionListItemSchema>;
