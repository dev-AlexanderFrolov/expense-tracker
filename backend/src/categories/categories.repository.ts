import { Injectable } from "@nestjs/common";
import { Category } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { userId: string; name: string; icon?: string; color?: string }): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  findAllByUser(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { userId } });
  }

  findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: { name?: string; icon?: string; color?: string },
  ): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }
}
