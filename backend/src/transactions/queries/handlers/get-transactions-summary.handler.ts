import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { TransactionSummary } from "@expense-tracker/shared";
import { GetTransactionsSummaryQuery } from "../get-transactions-summary.query";
import { TransactionsService } from "../../transactions.service";

@QueryHandler(GetTransactionsSummaryQuery)
export class GetTransactionsSummaryHandler implements IQueryHandler<GetTransactionsSummaryQuery> {
  constructor(private readonly transactionsService: TransactionsService) {}

  async execute(query: GetTransactionsSummaryQuery): Promise<TransactionSummary> {
    const { userId, month, year } = query;
    return this.transactionsService.summary(userId, month, year);
  }
}
