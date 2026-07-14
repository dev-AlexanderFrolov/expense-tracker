import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { TransactionSummary } from "@expense-tracker/shared";
import { GetTransactionsSummaryQuery } from "../get-transactions-summary.query";
import { TransactionsService } from "../../transactions.service";

/** Обработчик запроса {@link GetTransactionsSummaryQuery}. */
@QueryHandler(GetTransactionsSummaryQuery)
export class GetTransactionsSummaryHandler implements IQueryHandler<GetTransactionsSummaryQuery> {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Формирует сводку транзакций за месяц через {@link TransactionsService}.
   *
   * @param query - Запрос с userId, month и year.
   * @returns Агрегированные суммы доходов, расходов и баланс.
   */
  async execute(query: GetTransactionsSummaryQuery): Promise<TransactionSummary> {
    const { userId, month, year } = query;
    return this.transactionsService.summary(userId, month, year);
  }
}
