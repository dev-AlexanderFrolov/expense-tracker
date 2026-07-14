import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Transaction } from "@expense-tracker/shared";
import { CreateTransactionCommand } from "../create-transaction.command";
import { TransactionsService } from "../../transactions.service";

/** Обработчик команды {@link CreateTransactionCommand}. */
@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Создаёт транзакцию через {@link TransactionsService}.
   *
   * @param command - Команда с userId и DTO транзакции.
   * @returns Созданная транзакция.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   */
  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    const { userId, dto } = command;
    return this.transactionsService.create(userId, dto);
  }
}
