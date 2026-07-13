import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Transaction, TransactionSummary, User } from "@expense-tracker/shared";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { SummaryTransactionsDto } from "./dto/summary-transactions.dto";
import { CreateTransactionCommand } from "./commands/create-transaction.command";
import { UpdateTransactionCommand } from "./commands/update-transaction.command";
import { DeleteTransactionCommand } from "./commands/delete-transaction.command";
import { GetTransactionsQuery } from "./queries/get-transactions.query";
import { GetTransactionByIdQuery } from "./queries/get-transaction-by-id.query";
import { GetTransactionsSummaryQuery } from "./queries/get-transactions-summary.query";

@ApiTags("transactions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: "Создать транзакцию" })
  create(@CurrentUser() user: User, @Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.commandBus.execute(new CreateTransactionCommand(user.id, dto));
  }

  @Get()
  @ApiOperation({ summary: "Получить список транзакций пользователя с фильтрами" })
  findAll(@CurrentUser() user: User, @Query() query: QueryTransactionsDto): Promise<Transaction[]> {
    return this.queryBus.execute(new GetTransactionsQuery(user.id, query));
  }

  @Get("summary")
  @ApiOperation({ summary: "Получить агрегированную сводку по доходам/расходам за месяц" })
  summary(
    @CurrentUser() user: User,
    @Query() query: SummaryTransactionsDto,
  ): Promise<TransactionSummary> {
    return this.queryBus.execute(new GetTransactionsSummaryQuery(user.id, query.month, query.year));
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить транзакцию по id" })
  findOne(@CurrentUser() user: User, @Param("id") id: string): Promise<Transaction> {
    return this.queryBus.execute(new GetTransactionByIdQuery(user.id, id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить транзакцию" })
  update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.commandBus.execute(new UpdateTransactionCommand(user.id, id, dto));
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить транзакцию" })
  remove(@CurrentUser() user: User, @Param("id") id: string): Promise<void> {
    return this.commandBus.execute(new DeleteTransactionCommand(user.id, id));
  }
}
