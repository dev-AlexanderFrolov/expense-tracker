export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  amount: number;
  currency: string;
  description?: string;
  date: string;
  categoryId: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}
