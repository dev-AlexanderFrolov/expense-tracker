---
name: transactions module
overview: Add a Transaction model to Prisma and build a CQRS-based TransactionsModule in the NestJS backend (CRUD + filtered list + monthly summary), mirroring the existing categories structure with users-style CQRS, plus shared DTO types.
todos:
  - id: prisma
    content: Добавить enum TransactionType и модель Transaction в schema.prisma, обновить обратные связи в User/Category, создать и применить миграцию add-transactions, сгенерировать клиент
    status: pending
  - id: shared
    content: Добавить types/transaction.ts (TransactionType, Transaction, Create/Update DTO, TransactionSummary) в packages/shared и экспорт из index.ts
    status: pending
  - id: dto
    content: Создать DTO-классы (create/update/query/summary) с class-validator и swagger-декораторами, реализующие интерфейсы из shared
    status: pending
  - id: repository
    content: Реализовать TransactionsRepository (create/findAllByUser с фильтрами/findById/update/delete/aggregateByPeriod)
    status: pending
  - id: service
    content: Реализовать TransactionsService с изоляцией по userId (findOwnedOrThrow), маппингом Decimal/дат и агрегацией summary
    status: pending
  - id: cqrs
    content: Создать команды/запросы и их хендлеры (create/update/delete + getAll/getById/summary), делегирующие в сервис
    status: pending
  - id: module
    content: Создать TransactionsModule (CqrsModule + AuthModule, хендлеры в providers), контроллер с эндпоинтами (summary до :id) и зарегистрировать модуль в app.module.ts
    status: pending
  - id: build
    content: Запустить pnpm build (и typecheck) и убедиться в отсутствии ошибок
    status: pending
isProject: false
---

# Создание модуля транзакций (TransactionsModule)

Реализуем центральный модуль учёта доходов/расходов. Структура файлов — как в [backend/src/categories/](backend/src/categories/), взаимодействие контроллера с логикой — через CQRS (CommandBus/QueryBus), как в [backend/src/users/](backend/src/users/).

## 1. Prisma-схема и миграция

В [backend/prisma/schema.prisma](backend/prisma/schema.prisma):

- Добавить enum:

```prisma
enum TransactionType {
  INCOME
  EXPENSE
}
```

- Добавить модель `Transaction` (по полям из задачи; `amount` — `Decimal @db.Decimal(12, 2)` по образцу `Expense`; связи с `User` и `Category`; `@@map("transactions")`, `@@index([userId, date])`):

```prisma
model Transaction {
  id          String          @id @default(uuid())
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  description String?
  date        DateTime
  category    Category        @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  categoryId  String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  createdAt   DateTime        @default(now())

  @@index([userId, date])
  @@map("transactions")
}
```

- Обновить обратные связи: `transactions Transaction[]` в моделях `User` и `Category`.
- Применить миграцию: `npx prisma migrate dev --name add-transactions` (из `backend/`), затем `pnpm prisma:generate`.

## 2. Общие типы (packages/shared)

- Создать `packages/shared/src/types/transaction.ts`: `enum TransactionType { INCOME, EXPENSE }`, интерфейсы `Transaction`, `CreateTransactionDto`, `UpdateTransactionDto` (по образцу [expense.ts](packages/shared/src/types/expense.ts): `amount: number`, `date: string`, даты как ISO-строки).
- Экспортировать из [packages/shared/src/index.ts](packages/shared/src/index.ts).

## 3. Модуль транзакций (backend/src/transactions)

Структура (категории + CQRS из users):

```
backend/src/transactions/
├── transactions.module.ts
├── transactions.controller.ts
├── transactions.service.ts
├── transactions.repository.ts
├── dto/
│   ├── create-transaction.dto.ts
│   ├── update-transaction.dto.ts
│   └── query-transactions.dto.ts      # dateFrom, dateTo, type, categoryId (все опциональны)
│   └── summary-transactions.dto.ts    # month, year (обязательные)
├── commands/
│   ├── create-transaction.command.ts
│   ├── update-transaction.command.ts
│   ├── delete-transaction.command.ts
│   └── handlers/ (3 хендлера)
└── queries/
    ├── get-transactions.query.ts
    ├── get-transaction-by-id.query.ts
    ├── get-transactions-summary.query.ts
    └── handlers/ (3 хендлера)
```

- **DTO** — интерфейс из `@expense-tracker/shared` + класс с `class-validator`/`@nestjs/swagger` (как в [create-category.dto.ts](backend/src/categories/dto/create-category.dto.ts)). Query-DTO: `@IsOptional` + `@IsDateString`/`@IsEnum(TransactionType)`/`@IsUUID`. Summary-DTO: `month` (1–12) и `year` — `@Type(() => Number)` + `@IsInt`/`@Min`/`@Max`, оба обязательны.
- **Controller** — `@UseGuards(JwtAuthGuard)`, `@ApiBearerAuth()`, `@ApiTags("transactions")`, инжектит `CommandBus`/`QueryBus`, берёт `user.id` через `@CurrentUser()`. Эндпоинты: `POST /transactions`, `GET /transactions` (query-фильтры), `GET /transactions/summary`, `GET /transactions/:id`, `PATCH /transactions/:id`, `DELETE /transactions/:id`. Важно: маршрут `summary` объявить **до** `:id`, чтобы не перехватывался параметром.
- **Service** — бизнес-логика + изоляция по пользователю: `findOwnedOrThrow(userId, id)` → `NotFoundException` для чужой/несуществующей записи (как в [categories.service.ts](backend/src/categories/categories.service.ts)). Маппинг Prisma→shared: `amount` (Decimal) → `Number(...)`, даты → `toISOString()`. Метод `summary` агрегирует за месяц/год.
- **Repository** — тонкая обёртка над `PrismaService`: `create`, `findAllByUser(userId, filters)` (собирает `where` из фильтров + диапазон дат), `findById`, `update`, `delete`, `aggregateByPeriod(userId, month, year)`.
- **CQRS** — команды/хендлеры и запросы/хендлеры по образцу [users](backend/src/users/); хендлеры делегируют в `TransactionsService`.
- **Module** — `imports: [CqrsModule, AuthModule]`, в `providers` — service, repository и все хендлеры (спред-массивы `commandHandlers`/`queryHandlers`, как в [users.module.ts](backend/src/users/users.module.ts)).

## 4. Регистрация и сборка

- Добавить `TransactionsModule` в `imports` [backend/src/app.module.ts](backend/src/app.module.ts).
- Запустить сборку: `pnpm build` (и при желании `pnpm typecheck`).

## Решение по /transactions/summary (уточнить при необходимости)

Задача не задаёт форму ответа. Предлагаемый дефолт для месяца/года:

```json
{
  "month": 7,
  "year": 2026,
  "totalIncome": 0,
  "totalExpense": 0,
  "balance": 0,
  "byCategory": [{ "categoryId": "...", "type": "EXPENSE", "total": 0 }]
}
```

Тип ответа `TransactionSummary` также добавить в `packages/shared`.

## Ограничения (из задачи)

- Новые зависимости не добавляем (всё нужное уже есть: `@nestjs/cqrs`, `class-validator`, `class-transformer`).
- Для DTO — только `class-validator`.
