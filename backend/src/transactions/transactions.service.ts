import { Injectable, NotFoundException } from "@nestjs/common";
import { Transaction as PrismaTransaction, TransactionType as PrismaTransactionType } from "@prisma/client";
import { Transaction, TransactionSummary, TransactionType } from "@expense-tracker/shared";
import { TransactionsRepository } from "./transactions.repository";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionsRepository: TransactionsRepository) {}

  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionsRepository.create({
      userId,
      amount: dto.amount,
      type: dto.type as PrismaTransactionType,
      description: dto.description,
      date: new Date(dto.date),
      categoryId: dto.categoryId,
    });
    return this.toPublic(transaction);
  }

  async findAll(userId: string, query: QueryTransactionsDto): Promise<Transaction[]> {
    const transactions = await this.transactionsRepository.findAllByUser(userId, {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      type: query.type as PrismaTransactionType | undefined,
      categoryId: query.categoryId,
    });
    return transactions.map((transaction) => this.toPublic(transaction));
  }

  async findOne(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.findOwnedOrThrow(userId, id);
    return this.toPublic(transaction);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    await this.findOwnedOrThrow(userId, id);

    const transaction = await this.transactionsRepository.update(id, {
      amount: dto.amount,
      type: dto.type as PrismaTransactionType | undefined,
      description: dto.description,
      date: dto.date ? new Date(dto.date) : undefined,
      categoryId: dto.categoryId,
    });
    return this.toPublic(transaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);
    await this.transactionsRepository.delete(id);
  }

  async summary(userId: string, month: number, year: number): Promise<TransactionSummary> {
    const aggregates = await this.transactionsRepository.aggregateByPeriod(userId, month, year);

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = aggregates.map((item) => {
      const total = item.total ? Number(item.total) : 0;
      if (item.type === PrismaTransactionType.INCOME) {
        totalIncome += total;
      } else {
        totalExpense += total;
      }
      return {
        categoryId: item.categoryId,
        type: item.type as TransactionType,
        total,
      };
    });

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
    };
  }

  private async findOwnedOrThrow(userId: string, id: string): Promise<PrismaTransaction> {
    const transaction = await this.transactionsRepository.findById(id);
    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException("Транзакция не найдена");
    }
    return transaction;
  }

  private toPublic(transaction: PrismaTransaction): Transaction {
    const { id, amount, type, description, date, categoryId, userId, createdAt } = transaction;
    return {
      id,
      amount: Number(amount),
      type: type as TransactionType,
      description: description ?? undefined,
      date: date.toISOString(),
      categoryId,
      userId,
      createdAt: createdAt.toISOString(),
    };
  }
}
