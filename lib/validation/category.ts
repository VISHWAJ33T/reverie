import * as z from "zod";

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  show_in_nav: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const categoryCreateSchema = categorySchema.omit({ id: true });
export const categoryUpdateSchema = categorySchema.extend({
  id: z.string().uuid(),
});
