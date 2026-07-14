import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthModule } from "../auth/auth.module";
import { CategoriesModule } from "../categories/categories.module";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { TransactionsRepository } from "./transactions.repository";
import { CreateTransactionHandler } from "./commands/handlers/create-transaction.handler";
import { UpdateTransactionHandler } from "./commands/handlers/update-transaction.handler";
import { DeleteTransactionHandler } from "./commands/handlers/delete-transaction.handler";
import { GetTransactionsHandler } from "./queries/handlers/get-transactions.handler";
import { GetTransactionByIdHandler } from "./queries/handlers/get-transaction-by-id.handler";
import { GetTransactionsSummaryHandler } from "./queries/handlers/get-transactions-summary.handler";

const commandHandlers = [CreateTransactionHandler, UpdateTransactionHandler, DeleteTransactionHandler];
const queryHandlers = [
  GetTransactionsHandler,
  GetTransactionByIdHandler,
  GetTransactionsSummaryHandler,
];

@Module({
  imports: [CqrsModule, AuthModule, CategoriesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, ...commandHandlers, ...queryHandlers],
})
export class TransactionsModule {}
