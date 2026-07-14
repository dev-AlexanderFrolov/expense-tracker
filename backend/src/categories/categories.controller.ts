import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Category, User } from "@expense-tracker/shared";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { HttpExceptionResponseDto } from "../common/swagger/http-exception.response";
import { CategoriesService } from "./categories.service";
import { CategoryResponseDto } from "./dto/category-response.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

/** REST-контроллер категорий расходов/доходов текущего пользователя. */
@ApiTags("categories")
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: "Отсутствует или невалиден JWT",
  type: HttpExceptionResponseDto,
})
@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Создаёт категорию для текущего пользователя.
   *
   * @param user - Аутентифицированный пользователь.
   * @param dto - Имя, иконка и цвет категории.
   * @returns Созданная категория.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {BadRequestException} Невалидные данные запроса.
   * @throws {ConflictException} Категория с таким именем уже существует.
   */
  @Post()
  @ApiOperation({ summary: "Создать категорию" })
  @ApiCreatedResponse({ description: "Категория создана", type: CategoryResponseDto })
  @ApiBadRequestResponse({
    description: "Невалидные данные запроса",
    type: HttpExceptionResponseDto,
  })
  @ApiConflictResponse({
    description: "Категория с таким именем уже существует",
    type: HttpExceptionResponseDto,
  })
  create(@CurrentUser() user: User, @Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(user.id, dto);
  }

  /**
   * Возвращает все категории текущего пользователя.
   *
   * @param user - Аутентифицированный пользователь.
   * @returns Список категорий пользователя.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   */
  @Get()
  @ApiOperation({ summary: "Получить список категорий пользователя" })
  @ApiOkResponse({
    description: "Список категорий текущего пользователя",
    type: CategoryResponseDto,
    isArray: true,
  })
  findAll(@CurrentUser() user: User): Promise<Category[]> {
    return this.categoriesService.findAll(user.id);
  }

  /**
   * Обновляет категорию текущего пользователя.
   *
   * @param user - Аутентифицированный пользователь.
   * @param id - Идентификатор категории.
   * @param dto - Поля для обновления.
   * @returns Обновлённая категория.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {BadRequestException} Невалидные данные запроса.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   * @throws {ConflictException} Категория с таким именем уже существует.
   */
  @Patch(":id")
  @ApiOperation({ summary: "Обновить категорию" })
  @ApiParam({ name: "id", description: "Идентификатор категории", format: "uuid" })
  @ApiOkResponse({ description: "Категория обновлена", type: CategoryResponseDto })
  @ApiBadRequestResponse({
    description: "Невалидные данные запроса",
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Категория не найдена или принадлежит другому пользователю",
    type: HttpExceptionResponseDto,
  })
  @ApiConflictResponse({
    description: "Категория с таким именем уже существует",
    type: HttpExceptionResponseDto,
  })
  update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(user.id, id, dto);
  }

  /**
   * Удаляет категорию текущего пользователя.
   *
   * @param user - Аутентифицированный пользователь.
   * @param id - Идентификатор категории.
   * @returns Пустой ответ при успешном удалении.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   * @throws {ConflictException} К категории привязаны транзакции.
   */
  @Delete(":id")
  @ApiOperation({ summary: "Удалить категорию" })
  @ApiParam({ name: "id", description: "Идентификатор категории", format: "uuid" })
  @ApiOkResponse({ description: "Категория удалена" })
  @ApiNotFoundResponse({
    description: "Категория не найдена или принадлежит другому пользователю",
    type: HttpExceptionResponseDto,
  })
  @ApiConflictResponse({
    description: "К категории привязаны транзакции",
    type: HttpExceptionResponseDto,
  })
  remove(@CurrentUser() user: User, @Param("id") id: string): Promise<void> {
    return this.categoriesService.remove(user.id, id);
  }
}
