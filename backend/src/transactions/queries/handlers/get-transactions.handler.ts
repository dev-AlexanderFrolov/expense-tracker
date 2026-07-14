import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PaginatedResult, Transaction } from "@expense-tracker/shared";
import { GetTransactionsQuery } from "../get-transactions.query";
import { TransactionsService } from "../../transactions.service";

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(private readonly transactionsService: TransactionsService) {}

  async execute(query: GetTransactionsQuery): Promise<PaginatedResult<Transaction>> {
    const { userId, query: filters } = query;
    return this.transactionsService.findAll(userId, filters);
  }
}
