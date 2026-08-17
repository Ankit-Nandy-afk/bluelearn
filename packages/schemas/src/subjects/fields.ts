import { z } from "zod";

export const subjectNameSchema = z
  .string()
  .min(3, { message: "Subject must be at least 3 characters long." })
  .max(50, { message: "Subject can be no longer than 50 characters." });

export const subjectSummarySchema = z.string().trim().max(500);

export const subjectSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
