import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { PaginatedResult, Transaction, TransactionSummary, User } from "@expense-tracker/shared";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { HttpExceptionResponseDto } from "../common/swagger/http-exception.response";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { SummaryTransactionsDto } from "./dto/summary-transactions.dto";
import {
  PaginatedTransactionsResponseDto,
  TransactionResponseDto,
  TransactionSummaryResponseDto,
} from "./dto/transaction-response.dto";
import { CreateTransactionCommand } from "./commands/create-transaction.command";
import { UpdateTransactionCommand } from "./commands/update-transaction.command";
import { DeleteTransactionCommand } from "./commands/delete-transaction.command";
import { GetTransactionsQuery } from "./queries/get-transactions.query";
import { GetTransactionByIdQuery } from "./queries/get-transaction-by-id.query";
import { GetTransactionsSummaryQuery } from "./queries/get-transactions-summary.query";

/** REST-контроллер транзакций: CRUD, фильтрация и сводка за период. */
@ApiTags("transactions")
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: "Отсутствует или невалиден JWT",
  type: HttpExceptionResponseDto,
})
@UseGuards(JwtAuthGuard)
@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт транзакцию для текущего пользователя.
   *
   * @param user - Аутентифицированный пользователь.
   * @param dto - Сумма, тип, дата, категория и описание.
   * @returns Созданная транзакция.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {BadRequestException} Невалидные данные запроса.
   * @throws {NotFoundException} Категория не найдена или принадлежит другому пользователю.
   */
  @Post()
  @ApiOperation({ summary: "Создать транзакцию" })
  @ApiCreatedResponse({ description: "Транзакция создана", type: TransactionResponseDto })
  @ApiBadRequestResponse({
    description: "Невалидные данные запроса",
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Категория не найдена или принадлежит другому пользователю",
    type: HttpExceptionResponseDto,
  })
  create(@CurrentUser() user: User, @Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.commandBus.execute(new CreateTransactionCommand(user.id, dto));
  }

  /**
   * Возвращает список транзакций с фильтрами и пагинацией.
   *
   * @param user - Аутентифицированный пользователь.
   * @param query - Фильтры по дате, типу, категории и параметры пагинации.
   * @returns Страница транзакций с метаданными пагинации.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {BadRequestException} Невалидные query-параметры.
   */
  @Get()
  @ApiOperation({ summary: "Получить список транзакций пользователя с фильтрами и пагинацией" })
  @ApiOkResponse({
    description: "Пагинированный список транзакций",
    type: PaginatedTransactionsResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Невалидные query-параметры",
    type: HttpExceptionResponseDto,
  })
  findAll(
    @CurrentUser() user: User,
    @Query() query: QueryTransactionsDto,
  ): Promise<PaginatedResult<Transaction>> {
    return this.queryBus.execute(new GetTransactionsQuery(user.id, query));
  }

  /**
   * Возвращает агрегированную сводку доходов и расходов за месяц.
   *
   * @param user - Аутентифицированный пользователь.
   * @param query - Месяц и год периода (обязательные).
   * @returns Суммы доходов/расходов, баланс и разбивка по категориям.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {BadRequestException} Невалидные query-параметры.
   */
  @Get("summary")
  @ApiOperation({ summary: "Получить агрегированную сводку по доходам/расходам за месяц" })
  @ApiOkResponse({
    description: "Сводка доходов, расходов и баланс за месяц",
    type: TransactionSummaryResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Невалидные query-параметры (month/year обязательны)",
    type: HttpExceptionResponseDto,
  })
  summary(
    @CurrentUser() user: User,
    @Query() query: SummaryTransactionsDto,
  ): Promise<TransactionSummary> {
    return this.queryBus.execute(new GetTransactionsSummaryQuery(user.id, query.month, query.year));
  }

  /**
   * Возвращает транзакцию по идентификатору.
   *
   * @param user - Аутентифицированный пользователь.
   * @param id - Идентификатор транзакции.
   * @returns Транзакция пользователя.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {NotFoundException} Транзакция не найдена или принадлежит другому пользователю.
   */
  @Get(":id")
  @ApiOperation({ summary: "Получить транзакцию по id" })
  @ApiParam({ name: "id", description: "Идентификатор транзакции", format: "uuid" })
  @ApiOkResponse({ description: "Транзакция найдена", type: TransactionResponseDto })
  @ApiNotFoundResponse({
    description: "Транзакция не найдена или принадлежит другому пользователю",
    type: HttpExceptionResponseDto,
  })
  findOne(@CurrentUser() user: User, @Param("id") id: string): Promise<Transaction> {
    return this.queryBus.execute(new GetTransactionByIdQuery(user.id, id));
  }

  /**
   * Обновляет транзакцию текущего пользователя.
   *
   * @param user - Аутентифицированный пользователь.
   * @param id - Идентификатор транзакции.
   * @param dto - Поля для обновления.
   * @returns Обновлённая транзакция.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {BadRequestException} Невалидные данные запроса.
   * @throws {NotFoundException} Транзакция или категория не найдены / принадлежат другому пользователю.
   */
  @Patch(":id")
  @ApiOperation({ summary: "Обновить транзакцию" })
  @ApiParam({ name: "id", description: "Идентификатор транзакции", format: "uuid" })
  @ApiOkResponse({ description: "Транзакция обновлена", type: TransactionResponseDto })
  @ApiBadRequestResponse({
    description: "Невалидные данные запроса",
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Транзакция или категория не найдены / принадлежат другому пользователю",
    type: HttpExceptionResponseDto,
  })
  update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.commandBus.execute(new UpdateTransactionCommand(user.id, id, dto));
  }

  /**
   * Удаляет транзакцию текущего пользователя.
   *
   * @param user - Аутентифицированный пользователь.
   * @param id - Идентификатор транзакции.
   * @returns Пустой ответ при успешном удалении.
   * @throws {UnauthorizedException} Отсутствует или невалиден JWT.
   * @throws {NotFoundException} Транзакция не найдена или принадлежит другому пользователю.
   */
  @Delete(":id")
  @ApiOperation({ summary: "Удалить транзакцию" })
  @ApiParam({ name: "id", description: "Идентификатор транзакции", format: "uuid" })
  @ApiOkResponse({ description: "Транзакция удалена" })
  @ApiNotFoundResponse({
    description: "Транзакция не найдена или принадлежит другому пользователю",
    type: HttpExceptionResponseDto,
  })
  remove(@CurrentUser() user: User, @Param("id") id: string): Promise<void> {
    return this.commandBus.execute(new DeleteTransactionCommand(user.id, id));
  }
}
