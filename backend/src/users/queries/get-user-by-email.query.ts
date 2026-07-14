/** CQRS-запрос пользователя по email. */
export class GetUserByEmailQuery {
  /**
   * @param email - Email в нижнем регистре.
   */
  constructor(public readonly email: string) {}
}
