import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Transaction } from "@expense-tracker/shared";
import { CreateTransactionCommand } from "../create-transaction.command";
import { TransactionsService } from "../../transactions.service";

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  constructor(private readonly transactionsService: TransactionsService) {}

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    const { userId, dto } = command;
    return this.transactionsService.create(userId, dto);
  }
}
