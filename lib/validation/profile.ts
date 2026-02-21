import * as z from "zod";

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "Firstname must be at least 2 characters.",
    })
    .max(30, {
      message: "Firstname must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .max(30, { message: "Lastname must not be longer than 30 characters." })
    .optional()
    .transform((v) => (v?.trim() === "" ? undefined : v?.trim())),
  userName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const profileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string().optional(),
  userName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});
