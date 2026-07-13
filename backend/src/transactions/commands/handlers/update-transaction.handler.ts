import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Transaction } from "@expense-tracker/shared";
import { UpdateTransactionCommand } from "../update-transaction.command";
import { TransactionsService } from "../../transactions.service";

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(private readonly transactionsService: TransactionsService) {}

  async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    const { userId, id, dto } = command;
    return this.transactionsService.update(userId, id, dto);
  }
}
