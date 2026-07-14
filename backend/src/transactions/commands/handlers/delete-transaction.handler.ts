import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteTransactionCommand } from "../delete-transaction.command";
import { TransactionsService } from "../../transactions.service";

/** Обработчик команды {@link DeleteTransactionCommand}. */
@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Удаляет транзакцию через {@link TransactionsService}.
   *
   * @param command - Команда с userId и id транзакции.
   * @throws {NotFoundException} Транзакция не найдена или принадлежит другому пользователю.
   */
  async execute(command: DeleteTransactionCommand): Promise<void> {
    const { userId, id } = command;
    return this.transactionsService.remove(userId, id);
  }
}
