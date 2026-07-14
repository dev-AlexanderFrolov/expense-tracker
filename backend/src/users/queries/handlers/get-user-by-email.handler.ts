import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByEmailQuery } from "../get-user-by-email.query";
import { UsersService, UserWithPassword } from "../../users.service";

/** Обработчик запроса {@link GetUserByEmailQuery}. */
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Ищет пользователя по email через {@link UsersService}.
   *
   * @param query - Запрос с email.
   * @returns Prisma-модель с паролем или `null`.
   */
  async execute(query: GetUserByEmailQuery): Promise<UserWithPassword | null> {
    return this.usersService.findByEmail(query.email);
  }
}
