import type { AuthResponse, LoginDto } from "@expense-tracker/shared";
import { apiRequest } from "@/shared/api/client";

export function loginRequest(dto: LoginDto): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", { method: "POST", body: dto });
}
