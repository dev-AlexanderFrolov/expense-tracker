import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/entities/user";
import { loginRequest } from "../api/login";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: setAuth,
  });
}
