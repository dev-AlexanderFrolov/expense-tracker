import { z } from "zod";
import { TransactionType } from "@expense-tracker/shared";

export const createTransactionSchema = z.object({
  amount: z.number({ message: "Введите сумму" }).positive("Сумма должна быть больше нуля"),
  type: z.nativeEnum(TransactionType),
  categoryId: z.string().min(1, "Выберите категорию"),
  date: z.string().min(1, "Укажите дату"),
  description: z.string().max(255, "Максимум 255 символов").optional(),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
