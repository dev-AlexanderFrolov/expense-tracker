import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Category as PrismaCategory, Prisma } from "@prisma/client";
import { Category } from "@expense-tracker/shared";
import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoriesRepository.create({ userId, ...dto });
      return this.toPublic(category);
    } catch (error) {
      throw this.toConflictIfUnique(error);
    }
  }

  async findAll(userId: string): Promise<Category[]> {
    const categories = await this.categoriesRepository.findAllByUser(userId);
    return categories.map((category) => this.toPublic(category));
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOwnedOrThrow(userId, id);

    try {
      const category = await this.categoriesRepository.update(id, dto);
      return this.toPublic(category);
    } catch (error) {
      throw this.toConflictIfUnique(error);
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);
    await this.categoriesRepository.delete(id);
  }

  async assertOwnedByUser(userId: string, categoryId: string): Promise<void> {
    await this.findOwnedOrThrow(userId, categoryId);
  }

  private async findOwnedOrThrow(userId: string, id: string): Promise<PrismaCategory> {
    const category = await this.categoriesRepository.findById(id);
    if (!category || category.userId !== userId) {
      throw new NotFoundException("Категория не найдена");
    }
    return category;
  }

  private toConflictIfUnique(error: unknown): unknown {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return new ConflictException("Категория с таким именем уже существует");
    }
    return error;
  }

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
