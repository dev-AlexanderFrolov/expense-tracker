import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Введите название").max(50, "Максимум 50 символов"),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
