"use client";

import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTransactions, transactionKeys } from "@/entities/transaction";
import { getCategories, categoryKeys } from "@/entities/category";
import { useAuthStore } from "@/entities/user";

const PAGE_SIZE = 10;

export function useTransactionsList(page: number, onPageChange: (page: number) => void) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = { page, limit: PAGE_SIZE };

  const transactionsQuery = useQuery({
    queryKey: transactionKeys.list(query),
    queryFn: () => getTransactions(query),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const data = transactionsQuery.data;
    if (!data || data.total === 0) return;

    if (page > data.totalPages) {
      onPageChange(data.totalPages);
    }
  }, [page, transactionsQuery.data, onPageChange]);

  return {
    pageSize: PAGE_SIZE,
    transactions: transactionsQuery.data,
    categories: categoriesQuery.data,
    isLoading: transactionsQuery.isLoading || categoriesQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
  };
}
