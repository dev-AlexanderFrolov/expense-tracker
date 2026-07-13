import type { Category } from "@expense-tracker/shared";
import { apiRequest } from "@/shared/api/client";

export function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/categories");
}
