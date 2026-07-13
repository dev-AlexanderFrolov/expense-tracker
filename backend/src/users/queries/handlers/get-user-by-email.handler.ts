import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByEmailQuery } from "../get-user-by-email.query";
import { UsersService, UserWithPassword } from "../../users.service";

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly usersService: UsersService) {}

  async execute(query: GetUserByEmailQuery): Promise<UserWithPassword | null> {
    return this.usersService.findByEmail(query.email);
  }
}
