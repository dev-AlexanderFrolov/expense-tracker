import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Category, User } from "@expense-tracker/shared";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: "Создать категорию" })
  create(@CurrentUser() user: User, @Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "Получить список категорий пользователя" })
  findAll(@CurrentUser() user: User): Promise<Category[]> {
    return this.categoriesService.findAll(user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить категорию" })
  update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить категорию" })
  remove(@CurrentUser() user: User, @Param("id") id: string): Promise<void> {
    return this.categoriesService.remove(user.id, id);
  }
}
