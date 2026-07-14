# AGENTS.md — Backend

Контекст backend-воркспейса для AI-агентов. Общая информация по монорепозиторию — в [корневом AGENTS.md](../AGENTS.md).

## Стек

- **Framework:** NestJS 11, REST + Swagger (`/docs`), TypeScript 5
- **БД / ORM:** PostgreSQL 17 + Prisma 6
- **Порт:** 4000

## Структура

```
backend/
├── src/
│   ├── main.ts           # bootstrap: helmet, CORS, ValidationPipe, PrismaExceptionFilter; Swagger только вне production
│   ├── app.module.ts
│   ├── config/           # validateEnv — fail-fast проверка env при старте
│   ├── prisma/           # PrismaModule (@Global) + PrismaService + PrismaExceptionFilter
│   ├── auth/             # регистрация/логин, JwtAuthGuard, @CurrentUser()
│   ├── users/            # CQRS (CreateUser/GetUserByEmail/GetUserById)
│   ├── categories/       # CRUD категорий (repository → service → controller)
│   └── transactions/     # CRUD + фильтры + summary по транзакциям (CQRS, как Users)
└── prisma/
    └── schema.prisma     # модели User, Category, Transaction
```

## Реализованные модули

- **Auth** (`src/auth`): `POST /auth/register`, `POST /auth/login` — выдают `accessToken` (JWT) + `user`. `JwtAuthGuard` + `@CurrentUser()` — для защиты остальных эндпоинтов.
- **Users** (`src/users`): CQRS (команды/запросы), используется из `Auth`.
- **Categories** (`src/categories`): CRUD категорий трат, требует `JwtAuthGuard`.
  - `POST /categories`, `GET /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`.
  - Изоляция по пользователю: чужая категория → `404`; дубликат имени (`@@unique([userId, name])`) → `409`. `CategoriesService` экспортируется — используется в `Transactions` для проверки владельца `categoryId`.
  - Архитектура: прямой инжект `Controller -> Service -> Repository` (без CQRS, в отличие от `Users`).
  - DTO (`CreateCategoryDto`/`UpdateCategoryDto`) — в `packages/shared` + класс-валидаторы в `src/categories/dto`.
- **Transactions** (`src/transactions`): учёт доходов/расходов, требует `JwtAuthGuard`.
  - `POST /transactions`, `GET /transactions` (фильтры `dateFrom`/`dateTo`/`type`/`categoryId` + пагинация `page`/`limit`, дефолт 1/10, ответ `PaginatedResult<Transaction>`), `GET /transactions/summary` (агрегация по `month`+`year`, оба обязательны), `GET /transactions/:id`, `PATCH /transactions/:id`, `DELETE /transactions/:id`. Маршрут `summary` объявлен до `:id`.
  - Архитектура: CQRS (`CommandBus`/`QueryBus` в контроллере, хендлеры → `TransactionsService` → `TransactionsRepository`), по образцу `Users`.
  - Изоляция по пользователю через `findOwnedOrThrow` (как в `Categories`); при create/update дополнительно проверяется, что `categoryId` принадлежит текущему пользователю. `amount` > 0 (`@IsPositive`), `limit` ≤ 100; `amount` — `Decimal(12,2)` → `number`, даты → ISO-строки.
  - Типы/DTO (`Transaction`, `Create/UpdateTransactionDto`, `TransactionSummary`) — в `packages/shared`.

## Соглашения

- Типы и DTO — только в `packages/shared` (импорт как `@expense-tracker/shared`); не дублируй интерфейсы локально.
- Prisma-схема одна: `backend/prisma/schema.prisma`. Модели маппятся на snake_case таблицы (`@@map`).
- `PrismaService` глобальный — инжектится в любой модуль без повторного импорта `PrismaModule`.
- Конфиги TypeScript и ESLint — из `@expense-tracker/tsconfig/*` и `@expense-tracker/eslint-config`; не создавай локальные копии.

## Тесты

Unit-тесты backend — Jest. Запуск из корня монорепозитория: `pnpm test`.

## Известные инфраструктурные фиксы

- **Backend не стартовал** (`ERR_MODULE_NOT_FOUND` при `require("@expense-tracker/shared")`) — пакет отдавал сырой `.ts` с `"type": "module"`, а Node в CommonJS-сборке backend не резолвил ESM-импорты без расширений. Исправлено: `packages/shared` теперь собирается в CommonJS (`pnpm build` → `dist/`), `main`/`types` указывают на `dist`; `turbo.json` подтягивает сборку shared перед `dev`.

## Безопасность и hardening

- Проверка владельца `categoryId` в транзакциях
- `validateEnv` при старте (`JWT_SECRET` ≥ 8 символов)
- `helmet`, throttler на `/auth/*`, `PrismaExceptionFilter` (P2002/P2003 → 409)
- Swagger только при `NODE_ENV !== production`
- CI (`.github/workflows/ci.yml`)
- Модель `Expense` удалена из Prisma/shared

## Окружение

- `backend/.env` — `PORT`, `DATABASE_URL`, `JWT_SECRET` (≥ 8 символов), `JWT_EXPIRES_IN`; опционально `CORS_ORIGIN` (whitelist через запятую, для production), `NODE_ENV` (см. `backend/.env.example`).
