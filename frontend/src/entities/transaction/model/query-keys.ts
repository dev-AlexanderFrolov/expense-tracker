import type { QueryTransactionsDto } from "@expense-tracker/shared";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (query: QueryTransactionsDto) => [...transactionKeys.all, "list", query] as const,
};
