import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteTransactionCommand } from "../delete-transaction.command";
import { TransactionsService } from "../../transactions.service";

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(private readonly transactionsService: TransactionsService) {}

  async execute(command: DeleteTransactionCommand): Promise<void> {
    const { userId, id } = command;
    return this.transactionsService.remove(userId, id);
  }
}
