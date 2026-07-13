export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  categoryId: string;
  userId: string;
  createdAt: string;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  categoryId: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface QueryTransactionsDto {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  categoryId?: string;
}

export interface SummaryTransactionsDto {
  month: number;
  year: number;
}

export interface TransactionCategorySummary {
  categoryId: string;
  type: TransactionType;
  total: number;
}

export interface TransactionSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: TransactionCategorySummary[];
}
