import { CreateTransactionDto } from "../dto/create-transaction.dto";

/** CQRS-команда создания транзакции. */
export class CreateTransactionCommand {
  /**
   * @param userId - Идентификатор владельца транзакции.
   * @param dto - Данные новой транзакции.
   */
  constructor(
    public readonly userId: string,
    public readonly dto: CreateTransactionDto,
  ) {}
}
