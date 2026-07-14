/** CQRS-запрос сводки транзакций за календарный месяц. */
export class GetTransactionsSummaryQuery {
  /**
   * @param userId - Идентификатор владельца транзакций.
   * @param month - Номер месяца (1–12).
   * @param year - Календарный год.
   */
  constructor(
    public readonly userId: string,
    public readonly month: number,
    public readonly year: number,
  ) {}
}
