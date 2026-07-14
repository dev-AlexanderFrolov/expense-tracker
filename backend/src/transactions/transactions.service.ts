import { Injectable, NotFoundException } from "@nestjs/common";
import { Transaction as PrismaTransaction, TransactionType as PrismaTransactionType } from "@prisma/client";
import { PaginatedResult, Transaction, TransactionSummary, TransactionType } from "@expense-tracker/shared";
import { CategoriesService } from "../categories/categories.service";
import { TransactionsRepository } from "./transactions.repository";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";

/** Бизнес-логика транзакций: CRUD, фильтрация и агрегация. */
@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Создаёт транзакцию после проверки владения категорией.
   *
   * @param userId - Идентификатор владельца.
   * @param dto - Данные новой транзакции.
   * @returns Созданная транзакция в публичном формате.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   */
  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    await this.categoriesService.assertOwnedByUser(userId, dto.categoryId);

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

  /**
   * Возвращает страницу транзакций пользователя с фильтрами.
   *
   * @param userId - Идентификатор владельца.
   * @param query - Фильтры и параметры пагинации.
   * @returns Пагинированный список транзакций.
   */
  async findAll(userId: string, query: QueryTransactionsDto): Promise<PaginatedResult<Transaction>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { items, total } = await this.transactionsRepository.findAllByUser(
      userId,
      {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        type: query.type as PrismaTransactionType | undefined,
        categoryId: query.categoryId,
      },
      { page, limit },
    );

    return {
      items: items.map((transaction) => this.toPublic(transaction)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Возвращает одну транзакцию пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @param id - Идентификатор транзакции.
   * @returns Транзакция в публичном формате.
   * @throws {NotFoundException} Транзакция не найдена или принадлежит другому пользователю.
   */
  async findOne(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.findOwnedOrThrow(userId, id);
    return this.toPublic(transaction);
  }

  /**
   * Обновляет транзакцию пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @param id - Идентификатор транзакции.
   * @param dto - Поля для обновления.
   * @returns Обновлённая транзакция в публичном формате.
   * @throws {NotFoundException} Транзакция или категория не найдены / принадлежат другому пользователю.
   */
  async update(userId: string, id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    await this.findOwnedOrThrow(userId, id);

    if (dto.categoryId !== undefined) {
      await this.categoriesService.assertOwnedByUser(userId, dto.categoryId);
    }

    const transaction = await this.transactionsRepository.update(id, {
      amount: dto.amount,
      type: dto.type as PrismaTransactionType | undefined,
      description: dto.description,
      date: dto.date ? new Date(dto.date) : undefined,
      categoryId: dto.categoryId,
    });
    return this.toPublic(transaction);
  }

  /**
   * Удаляет транзакцию пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @param id - Идентификатор транзакции.
   * @throws {NotFoundException} Транзакция не найдена или принадлежит другому пользователю.
   */
  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);
    await this.transactionsRepository.delete(id);
  }

  /**
   * Формирует сводку доходов и расходов за указанный месяц.
   *
   * @param userId - Идентификатор владельца.
   * @param month - Номер месяца (1–12).
   * @param year - Календарный год.
   * @returns Агрегированные суммы и разбивка по категориям.
   */
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

  /**
   * Загружает транзакцию и проверяет принадлежность пользователю.
   *
   * @param userId - Идентификатор владельца.
   * @param id - Идентификатор транзакции.
   * @returns Prisma-модель транзакции.
   * @throws {NotFoundException} Транзакция не найдена или принадлежит другому пользователю.
   */
  private async findOwnedOrThrow(userId: string, id: string): Promise<PrismaTransaction> {
    const transaction = await this.transactionsRepository.findById(id);
    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException("Транзакция не найдена");
    }
    return transaction;
  }

  /**
   * Преобразует Prisma-модель транзакции в публичный DTO.
   *
   * @param transaction - Prisma-модель транзакции.
   * @returns Транзакция с числовой суммой и ISO-датами.
   */
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
