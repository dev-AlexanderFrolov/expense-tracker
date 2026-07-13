import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z.string().email("Введите корректный email"),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string().min(6, "Минимум 6 символов"),
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })
  .refine((data) => data.agreeToTerms, {
    message: "Необходимо согласие с пользовательским соглашением и политикой обработки данных",
    path: ["agreeToTerms"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
