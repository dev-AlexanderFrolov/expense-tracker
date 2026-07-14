"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryKeys, getCategories } from "@/entities/category";
import { useAuthStore } from "@/entities/user";

export function useCategoriesList() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
    enabled: isAuthenticated,
  });
}
