import { z } from "zod";

export const contributorSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable(),
});

export type Contributor = z.infer<typeof contributorSchema>;
