/** CQRS-запрос пользователя по идентификатору. */
export class GetUserByIdQuery {
  /**
   * @param id - Идентификатор пользователя.
   */
  constructor(public readonly id: string) {}
}
