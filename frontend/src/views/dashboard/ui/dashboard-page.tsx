import { TransactionsList } from "@/features/transactions/list";

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Транзакции</h1>
        <p className="text-sm text-muted-foreground">История ваших доходов и расходов</p>
      </div>
      <TransactionsList />
    </div>
  );
}
