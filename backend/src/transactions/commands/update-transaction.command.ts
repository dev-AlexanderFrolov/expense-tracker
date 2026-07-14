import { UpdateTransactionDto } from "../dto/update-transaction.dto";

/** CQRS-команда обновления транзакции. */
export class UpdateTransactionCommand {
  /**
   * @param userId - Идентификатор владельца транзакции.
   * @param id - Идентификатор транзакции.
   * @param dto - Поля для обновления.
   */
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly dto: UpdateTransactionDto,
  ) {}
}
