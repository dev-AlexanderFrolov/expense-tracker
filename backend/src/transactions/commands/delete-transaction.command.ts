/** CQRS-команда удаления транзакции. */
export class DeleteTransactionCommand {
  /**
   * @param userId - Идентификатор владельца транзакции.
   * @param id - Идентификатор транзакции.
   */
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
