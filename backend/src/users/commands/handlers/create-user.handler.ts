import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { User } from "@expense-tracker/shared";
import { CreateUserCommand } from "../create-user.command";
import { UsersService } from "../../users.service";

/** Обработчик команды {@link CreateUserCommand}. */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Создаёт пользователя через {@link UsersService}.
   *
   * @param command - Команда с email, именем и хешем пароля.
   * @returns Публичные данные созданного пользователя.
   * @throws {ConflictException} Пользователь с таким email уже существует.
   */
  async execute(command: CreateUserCommand): Promise<User> {
    const { email, name, password } = command;
    return this.usersService.create({ email, name, password });
  }
}
