import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Transaction } from "@expense-tracker/shared";
import { GetTransactionByIdQuery } from "../get-transaction-by-id.query";
import { TransactionsService } from "../../transactions.service";

@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler implements IQueryHandler<GetTransactionByIdQuery> {
  constructor(private readonly transactionsService: TransactionsService) {}

  async execute(query: GetTransactionByIdQuery): Promise<Transaction> {
    const { userId, id } = query;
    return this.transactionsService.findOne(userId, id);
  }
}
