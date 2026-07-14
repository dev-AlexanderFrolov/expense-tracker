import type { PaginatedResult, QueryTransactionsDto, Transaction } from "@expense-tracker/shared";
import { apiRequest } from "@/shared/api/client";

export function getTransactions(query: QueryTransactionsDto = {}): Promise<PaginatedResult<Transaction>> {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const search = params.toString();
  return apiRequest<PaginatedResult<Transaction>>(`/transactions${search ? `?${search}` : ""}`);
}
