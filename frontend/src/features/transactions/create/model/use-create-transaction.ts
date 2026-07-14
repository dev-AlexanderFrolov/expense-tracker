"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionKeys } from "@/entities/transaction";
import { createTransaction } from "../api/create-transaction";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
