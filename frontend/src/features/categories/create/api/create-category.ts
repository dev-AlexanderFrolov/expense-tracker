import type { Category, CreateCategoryDto } from "@expense-tracker/shared";
import { apiRequest } from "@/shared/api/client";

export function createCategory(dto: CreateCategoryDto): Promise<Category> {
  return apiRequest<Category>("/categories", { method: "POST", body: dto });
}
