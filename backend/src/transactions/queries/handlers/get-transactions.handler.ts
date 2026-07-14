import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PaginatedResult, Transaction } from "@expense-tracker/shared";
import { GetTransactionsQuery } from "../get-transactions.query";
import { TransactionsService } from "../../transactions.service";

/** Обработчик запроса {@link GetTransactionsQuery}. */
@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Возвращает пагинированный список транзакций через {@link TransactionsService}.
   *
   * @param query - Запрос с userId и фильтрами.
   * @returns Страница транзакций с метаданными пагинации.
   */
  async execute(query: GetTransactionsQuery): Promise<PaginatedResult<Transaction>> {
    const { userId, query: filters } = query;
    return this.transactionsService.findAll(userId, filters);
  }
}
