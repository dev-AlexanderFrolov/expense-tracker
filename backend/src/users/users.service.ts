import { ConflictException, Injectable } from "@nestjs/common";
import { User as PrismaUser } from "@prisma/client";
import { User } from "@expense-tracker/shared";
import { UsersRepository } from "./users.repository";

export type UserWithPassword = PrismaUser;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: { email: string; name: string; password: string }): Promise<User> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException("Пользователь с таким email уже существует");
    }

    const user = await this.usersRepository.create(data);
    return this.toPublicUser(user);
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findById(id);
    return user ? this.toPublicUser(user) : null;
  }

  private toPublicUser(user: PrismaUser): User {
    const { id, email, name, createdAt, updatedAt } = user;
    return {
      id,
      email,
      name,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
