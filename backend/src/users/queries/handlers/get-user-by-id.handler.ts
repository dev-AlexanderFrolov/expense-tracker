import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { User } from "@expense-tracker/shared";
import { GetUserByIdQuery } from "../get-user-by-id.query";
import { UsersService } from "../../users.service";

/** Обработчик запроса {@link GetUserByIdQuery}. */
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Ищет пользователя по id через {@link UsersService}.
   *
   * @param query - Запрос с id пользователя.
   * @returns Публичные данные пользователя или `null`.
   */
  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return this.usersService.findById(query.id);
  }
}
