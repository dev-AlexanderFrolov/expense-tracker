import { Injectable } from "@nestjs/common";
import { Category } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

/** Репозиторий категорий: доступ к таблице `Category` через Prisma. */
@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт категорию в БД.
   *
   * @param data - Данные новой категории.
   * @returns Созданная Prisma-модель категории.
   * @throws {Prisma.PrismaClientKnownRequestError} P2002 при дубликате `[userId, name]`.
   */
  create(data: { userId: string; name: string; icon?: string; color?: string }): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  /**
   * Возвращает все категории пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @returns Список Prisma-моделей категорий.
   */
  findAllByUser(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { userId } });
  }

  /**
   * Ищет категорию по идентификатору.
   *
   * @param id - Идентификатор категории.
   * @returns Prisma-модель категории или `null`.
   */
  findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  /**
   * Обновляет категорию по идентификатору.
   *
   * @param id - Идентификатор категории.
   * @param data - Поля для обновления.
   * @returns Обновлённая Prisma-модель категории.
   * @throws {Prisma.PrismaClientKnownRequestError} P2025 если запись не найдена; P2002 при дубликате имени.
   */
  update(
    id: string,
    data: { name?: string; icon?: string; color?: string },
  ): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  /**
   * Удаляет категорию по идентификатору.
   *
   * @param id - Идентификатор категории.
   * @returns Удалённая Prisma-модель категории.
   * @throws {Prisma.PrismaClientKnownRequestError} P2025 если запись не найдена; P2003 при связанных транзакциях.
   */
  delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }
}
