import { z } from "zod";

export const todoStatusSchema = z.enum(["open", "resolved"]);
