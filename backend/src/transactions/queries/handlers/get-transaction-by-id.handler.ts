import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Transaction } from "@expense-tracker/shared";
import { GetTransactionByIdQuery } from "../get-transaction-by-id.query";
import { TransactionsService } from "../../transactions.service";

/** Обработчик запроса {@link GetTransactionByIdQuery}. */
@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler implements IQueryHandler<GetTransactionByIdQuery> {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Возвращает одну транзакцию через {@link TransactionsService}.
   *
   * @param query - Запрос с userId и id транзакции.
   * @returns Транзакция пользователя.
   * @throws {NotFoundException} Транзакция не найдена или принадлежит другому пользователю.
   */
  async execute(query: GetTransactionByIdQuery): Promise<Transaction> {
    const { userId, id } = query;
    return this.transactionsService.findOne(userId, id);
  }
}
