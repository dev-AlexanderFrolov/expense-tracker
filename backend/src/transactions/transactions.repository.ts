import { Injectable } from "@nestjs/common";
import { Prisma, Transaction, TransactionType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

/** Фильтры списка транзакций. */
export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  categoryId?: string;
}

/** Параметры пагинации списка транзакций. */
export interface TransactionPagination {
  page: number;
  limit: number;
}

/** Результат пагинированного запроса транзакций. */
export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
}

/** Агрегат суммы транзакций по категории и типу. */
export interface TransactionCategoryAggregate {
  categoryId: string;
  type: TransactionType;
  total: Prisma.Decimal | null;
}

/** Репозиторий транзакций: доступ к таблице `Transaction` через Prisma. */
@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт транзакцию в БД.
   *
   * @param data - Данные новой транзакции.
   * @returns Созданная Prisma-модель транзакции.
   * @throws {Prisma.PrismaClientKnownRequestError} P2003 при несуществующей категории.
   */
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

  /**
   * Возвращает страницу транзакций пользователя с фильтрами.
   *
   * @param userId - Идентификатор владельца.
   * @param filters - Опциональные фильтры по дате, типу и категории.
   * @param pagination - Номер страницы и размер страницы.
   * @returns Список транзакций и общее количество записей.
   */
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

  /**
   * Ищет транзакцию по идентификатору.
   *
   * @param id - Идентификатор транзакции.
   * @returns Prisma-модель транзакции или `null`.
   */
  findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  /**
   * Обновляет транзакцию по идентификатору.
   *
   * @param id - Идентификатор транзакции.
   * @param data - Поля для обновления.
   * @returns Обновлённая Prisma-модель транзакции.
   * @throws {Prisma.PrismaClientKnownRequestError} P2025 если запись не найдена; P2003 при невалидной категории.
   */
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

  /**
   * Удаляет транзакцию по идентификатору.
   *
   * @param id - Идентификатор транзакции.
   * @returns Удалённая Prisma-модель транзакции.
   * @throws {Prisma.PrismaClientKnownRequestError} P2025 если запись не найдена.
   */
  delete(id: string): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id } });
  }

  /**
   * Агрегирует суммы транзакций по категориям за календарный месяц.
   *
   * @param userId - Идентификатор владельца.
   * @param month - Номер месяца (1–12).
   * @param year - Календарный год.
   * @returns Суммы по парам `[categoryId, type]`.
   */
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

  /**
   * Собирает Prisma-условие `where` из фильтров пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @param filters - Фильтры по дате, типу и категории.
   * @returns Условие выборки для Prisma.
   */
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
