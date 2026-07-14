import { QueryTransactionsDto } from "../dto/query-transactions.dto";

/** CQRS-запрос списка транзакций с фильтрами и пагинацией. */
export class GetTransactionsQuery {
  /**
   * @param userId - Идентификатор владельца транзакций.
   * @param query - Фильтры и параметры пагинации.
   */
  constructor(
    public readonly userId: string,
    public readonly query: QueryTransactionsDto,
  ) {}
}
