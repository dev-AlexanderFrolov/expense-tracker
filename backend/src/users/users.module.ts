import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { CreateUserHandler } from "./commands/handlers/create-user.handler";
import { GetUserByEmailHandler } from "./queries/handlers/get-user-by-email.handler";
import { GetUserByIdHandler } from "./queries/handlers/get-user-by-id.handler";

const commandHandlers = [CreateUserHandler];
const queryHandlers = [GetUserByEmailHandler, GetUserByIdHandler];

@Module({
  imports: [CqrsModule],
  providers: [UsersService, UsersRepository, ...commandHandlers, ...queryHandlers],
})
export class UsersModule {}
