import { Injectable } from "@nestjs/common";
import { Prisma, Transaction, TransactionType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  categoryId?: string;
}

export interface TransactionPagination {
  page: number;
  limit: number;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
}

export interface TransactionCategoryAggregate {
  categoryId: string;
  type: TransactionType;
  total: Prisma.Decimal | null;
}

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    amount: number;
    type: TransactionType;
    description?: string;
    date: Date;
    categoryId: string;
  }): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  async findAllByUser(
    userId: string,
    filters: TransactionFilters = {},
    pagination: TransactionPagination,
  ): Promise<PaginatedTransactions> {
    const where = this.buildWhere(userId, filters);
    const { page, limit } = pagination;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: {
      amount?: number;
      type?: TransactionType;
      description?: string | null;
      date?: Date;
      categoryId?: string;
    },
  ): Promise<Transaction> {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  delete(id: string): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id } });
  }

  async aggregateByPeriod(
    userId: string,
    month: number,
    year: number,
  ): Promise<TransactionCategoryAggregate[]> {
    const dateFrom = new Date(Date.UTC(year, month - 1, 1));
    const dateTo = new Date(Date.UTC(year, month, 1));

    const grouped = await this.prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: { userId, date: { gte: dateFrom, lt: dateTo } },
      _sum: { amount: true },
    });

    return grouped.map((item) => ({
      categoryId: item.categoryId,
      type: item.type,
      total: item._sum.amount,
    }));
  }

  private buildWhere(userId: string, filters: TransactionFilters): Prisma.TransactionWhereInput {
    const { dateFrom, dateTo, type, categoryId } = filters;
    const where: Prisma.TransactionWhereInput = { userId };

    if (type) {
      where.type = type;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (dateFrom || dateTo) {
      where.date = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    return where;
  }
}
