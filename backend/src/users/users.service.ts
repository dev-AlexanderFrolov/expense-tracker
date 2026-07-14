import { ConflictException, Injectable } from "@nestjs/common";
import { User as PrismaUser } from "@prisma/client";
import { User } from "@expense-tracker/shared";
import { UsersRepository } from "./users.repository";

/** Prisma-модель пользователя с полем пароля (только для внутреннего использования). */
export type UserWithPassword = PrismaUser;

/** Бизнес-логика пользователей: создание и поиск. */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Создаёт пользователя с уже захешированным паролем.
   *
   * @param data - Email, имя и хеш пароля.
   * @returns Публичные данные созданного пользователя.
   * @throws {ConflictException} Пользователь с таким email уже существует.
   */
  async create(data: { email: string; name: string; password: string }): Promise<User> {
    const email = data.email.toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException("Пользователь с таким email уже существует");
    }

    const user = await this.usersRepository.create({ ...data, email });
    return this.toPublicUser(user);
  }

  /**
   * Ищет пользователя по email, включая хеш пароля.
   *
   * @param email - Email пользователя (регистр не важен).
   * @returns Prisma-модель с паролем или `null`.
   */
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    return this.usersRepository.findByEmail(email.toLowerCase());
  }

  /**
   * Ищет пользователя по идентификатору.
   *
   * @param id - Идентификатор пользователя.
   * @returns Публичные данные пользователя или `null`.
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findById(id);
    return user ? this.toPublicUser(user) : null;
  }

  /**
   * Преобразует Prisma-модель пользователя в публичный DTO.
   *
   * @param user - Prisma-модель пользователя.
   * @returns Пользователь без пароля с ISO-датами.
   */
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
