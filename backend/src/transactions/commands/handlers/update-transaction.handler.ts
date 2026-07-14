import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Transaction } from "@expense-tracker/shared";
import { UpdateTransactionCommand } from "../update-transaction.command";
import { TransactionsService } from "../../transactions.service";

/** Обработчик команды {@link UpdateTransactionCommand}. */
@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Обновляет транзакцию через {@link TransactionsService}.
   *
   * @param command - Команда с userId, id и DTO обновления.
   * @returns Обновлённая транзакция.
   * @throws {NotFoundException} Транзакция или категория не найдены / принадлежат другому пользователю.
   */
  async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    const { userId, id, dto } = command;
    return this.transactionsService.update(userId, id, dto);
  }
}
