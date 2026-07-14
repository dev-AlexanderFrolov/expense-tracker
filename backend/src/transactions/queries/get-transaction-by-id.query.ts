/** CQRS-запрос одной транзакции по идентификатору. */
export class GetTransactionByIdQuery {
  /**
   * @param userId - Идентификатор владельца транзакции.
   * @param id - Идентификатор транзакции.
   */
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
