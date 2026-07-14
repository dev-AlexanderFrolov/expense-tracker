/** CQRS-команда создания пользователя. */
export class CreateUserCommand {
  /**
   * @param email - Email пользователя.
   * @param name - Отображаемое имя.
   * @param password - Хеш пароля (bcrypt).
   */
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
  ) {}
}
