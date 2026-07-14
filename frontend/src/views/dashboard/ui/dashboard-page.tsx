"use client";

import { useState } from "react";
import { TransactionsList } from "@/features/transactions/list";
import { CreateTransactionDialog } from "@/features/transactions/create";

export function DashboardPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Транзакции</h1>
          <p className="text-sm text-muted-foreground">История ваших доходов и расходов</p>
        </div>
        <CreateTransactionDialog onCreated={() => setPage(1)} />
      </div>
      <TransactionsList page={page} onPageChange={setPage} />
    </div>
  );
}
