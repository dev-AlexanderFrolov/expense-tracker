import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { User } from "@expense-tracker/shared";
import { GetUserByIdQuery } from "../get-user-by-id.query";
import { UsersService } from "../../users.service";

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly usersService: UsersService) {}

  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return this.usersService.findById(query.id);
  }
}
