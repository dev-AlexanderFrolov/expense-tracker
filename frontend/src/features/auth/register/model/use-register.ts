import { useMutation } from "@tanstack/react-query";
import type { CreateUserDto } from "@expense-tracker/shared";
import { useAuthStore } from "@/entities/user";
import { registerRequest } from "../api/register";
import type { RegisterFormValues } from "./schema";

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (values: RegisterFormValues) => {
      const dto: CreateUserDto = {
        email: values.email,
        name: values.name,
        password: values.password,
      };
      return registerRequest(dto);
    },
    onSuccess: setAuth,
  });
}
