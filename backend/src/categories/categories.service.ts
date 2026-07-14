import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Category as PrismaCategory, Prisma } from "@prisma/client";
import { Category } from "@expense-tracker/shared";
import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

/** Бизнес-логика категорий: CRUD и проверка владения. */
@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /**
   * Создаёт категорию для пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @param dto - Имя, иконка и цвет категории.
   * @returns Созданная категория в публичном формате.
   * @throws {ConflictException} Нарушено ограничение уникальности `[userId, name]`.
   */
  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoriesRepository.create({ userId, ...dto });
      return this.toPublic(category);
    } catch (error) {
      throw this.toConflictIfUnique(error);
    }
  }

  /**
   * Возвращает все категории пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @returns Список категорий в публичном формате.
   */
  async findAll(userId: string): Promise<Category[]> {
    const categories = await this.categoriesRepository.findAllByUser(userId);
    return categories.map((category) => this.toPublic(category));
  }

  /**
   * Обновляет категорию пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @param id - Идентификатор категории.
   * @param dto - Поля для обновления.
   * @returns Обновлённая категория в публичном формате.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   * @throws {ConflictException} Нарушено ограничение уникальности `[userId, name]`.
   */
  async update(userId: string, id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOwnedOrThrow(userId, id);

    try {
      const category = await this.categoriesRepository.update(id, dto);
      return this.toPublic(category);
    } catch (error) {
      throw this.toConflictIfUnique(error);
    }
  }

  /**
   * Удаляет категорию пользователя.
   *
   * @param userId - Идентификатор владельца.
   * @param id - Идентификатор категории.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   * @throws {ConflictException} К категории привязаны транзакции (P2003).
   */
  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);
    await this.categoriesRepository.delete(id);
  }

  /**
   * Проверяет, что категория существует и принадлежит пользователю.
   *
   * @param userId - Идентификатор владельца.
   * @param categoryId - Идентификатор категории.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   */
  async assertOwnedByUser(userId: string, categoryId: string): Promise<void> {
    await this.findOwnedOrThrow(userId, categoryId);
  }

  /**
   * Загружает категорию и проверяет принадлежность пользователю.
   *
   * @param userId - Идентификатор владельца.
   * @param id - Идентификатор категории.
   * @returns Prisma-модель категории.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   */
  private async findOwnedOrThrow(userId: string, id: string): Promise<PrismaCategory> {
    const category = await this.categoriesRepository.findById(id);
    if (!category || category.userId !== userId) {
      throw new NotFoundException("Категория не найдена");
    }
    return category;
  }

  /**
   * Преобразует Prisma-ошибку уникальности в HTTP Conflict.
   *
   * @param error - Перехваченная ошибка.
   * @returns ConflictException или исходная ошибка для проброса дальше.
   */
  private toConflictIfUnique(error: unknown): unknown {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return new ConflictException("Категория с таким именем уже существует");
    }
    return error;
  }

  /**
   * Преобразует Prisma-модель категории в публичный DTO.
   *
   * @param category - Prisma-модель категории.
   * @returns Категория с ISO-датами и опциональными полями.
   */
  private toPublic(category: PrismaCategory): Category {
    const { id, name, icon, color, userId, createdAt, updatedAt } = category;
    return {
      id,
      name,
      icon: icon ?? undefined,
      color: color ?? undefined,
      userId,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
