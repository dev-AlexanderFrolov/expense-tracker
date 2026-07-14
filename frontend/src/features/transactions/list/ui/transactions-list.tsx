"use client";

import type { Category, Transaction } from "@expense-tracker/shared";
import { TransactionType } from "@expense-tracker/shared";
import { useTransactionsList } from "../model/use-transactions";
import { TransactionsPagination } from "./transactions-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { ApiError } from "@/shared/api/client";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
const amountFormatter = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" });

function formatAmount(transaction: Transaction): string {
  const sign = transaction.type === TransactionType.EXPENSE ? "-" : "+";
  return `${sign}${amountFormatter.format(transaction.amount)}`;
}

function getCategoryName(categories: Category[] | undefined, categoryId: string): string {
  return categories?.find((category) => category.id === categoryId)?.name ?? "—";
}

interface TransactionsListProps {
  page: number;
  onPageChange: (page: number) => void;
}

export function TransactionsList({ page, onPageChange }: TransactionsListProps) {
  const { transactions, categories, isLoading, isFetching, isError, error } = useTransactionsList(
    page,
    onPageChange,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить транзакции</AlertTitle>
        <AlertDescription>
          {error instanceof ApiError ? error.message : "Попробуйте обновить страницу"}
        </AlertDescription>
      </Alert>
    );
  }

  const items = transactions?.items ?? [];
  const total = transactions?.total ?? 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">Пока нет транзакций</p>
        <p className="text-sm text-muted-foreground">Добавьте первую транзакцию, чтобы увидеть её здесь</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" aria-busy={isFetching}>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{dateFormatter.format(new Date(transaction.date))}</TableCell>
                <TableCell className="max-w-64 truncate">
                  {transaction.description ?? "—"}
                </TableCell>
                <TableCell>{getCategoryName(categories, transaction.categoryId)}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === TransactionType.INCOME ? "default" : "outline"}>
                    {transaction.type === TransactionType.INCOME ? "Доход" : "Расход"}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.type === TransactionType.INCOME ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {formatAmount(transaction)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransactionsPagination
        page={page}
        totalPages={transactions?.totalPages ?? 1}
        onPageChange={onPageChange}
        disabled={isFetching}
      />
    </div>
  );
}
