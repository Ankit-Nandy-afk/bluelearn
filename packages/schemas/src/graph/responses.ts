import { z } from "zod";
import { todoStatusSchema } from "./enums";

export const todoListItemSchema = z.object({
  id: z.uuid(),
  guide_base_id: z.uuid(),
  guide_slug: z.string().nullable(),
  guide_title: z.string().nullable(),
  title: z.string(),
  summary: z.string(),
  status: todoStatusSchema,
  claim_count: z.number().int(),
  created_at: z.iso.datetime(),
});

export type TodoStatus = z.infer<typeof todoStatusSchema>;
export type TodoListItem = z.infer<typeof todoListItemSchema>;
