import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

/** Репозиторий пользователей: доступ к таблице `User` через Prisma. */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ищет пользователя по email.
   *
   * @param email - Email в нижнем регистре.
   * @returns Prisma-модель пользователя или `null`.
   */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Ищет пользователя по идентификатору.
   *
   * @param id - Идентификатор пользователя.
   * @returns Prisma-модель пользователя или `null`.
   */
  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Создаёт пользователя в БД.
   *
   * @param data - Email, имя и хеш пароля.
   * @returns Созданная Prisma-модель пользователя.
   * @throws {Prisma.PrismaClientKnownRequestError} P2002 при дубликате email.
   */
  create(data: { email: string; name: string; password: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
