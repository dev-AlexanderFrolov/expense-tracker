import type { AuthResponse, CreateUserDto } from "@expense-tracker/shared";
import { apiRequest } from "@/shared/api/client";

export function registerRequest(dto: CreateUserDto): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", { method: "POST", body: dto });
}
