import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { User } from "@expense-tracker/shared";
import { CreateUserCommand } from "../create-user.command";
import { UsersService } from "../../users.service";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, name, password } = command;
    return this.usersService.create({ email, name, password });
  }
}
