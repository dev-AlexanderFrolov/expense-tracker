# AGENTS.md — Backend

Справочник API-модулей. Паттерны Nest/Prisma и hardening — в `.cursor/rules/backend-nest.mdc` и `.cursor/rules/backend-prisma.mdc`. Общий контекст монорепо — [корневой AGENTS.md](../AGENTS.md).

## Стек

- NestJS 11, REST + Swagger (`/docs`), TypeScript 5
- PostgreSQL 17 + Prisma 6
- Порт: 4000

## Структура

```
backend/
├── src/
│   ├── main.ts, app.module.ts, config/
│   ├── prisma/          # PrismaModule (@Global), PrismaExceptionFilter
│   ├── auth/            # register/login, JwtAuthGuard, @CurrentUser()
│   ├── users/           # CQRS
│   ├── categories/      # Controller → Service → Repository
│   └── transactions/    # CQRS + filters + summary
└── prisma/schema.prisma # User, Category, Transaction
```

## Эндпоинты

- **Auth:** `POST /auth/register`, `POST /auth/login` → `accessToken` + `user`.
- **Categories** (JWT): `POST/GET /categories`, `PATCH/DELETE /categories/:id`. Unique `[userId, name]` → 409; чужая → 404. `CategoriesService` экспортируется для проверки `categoryId` в Transactions.
- **Transactions** (JWT):
  - `POST /transactions`
  - `GET /transactions` — фильтры `dateFrom`/`dateTo`/`type`/`categoryId`, пагинация `page`/`limit` (дефолт 1/10), ответ `PaginatedResult<Transaction>`
  - `GET /transactions/summary` — `month` + `year` обязательны (маршрут до `:id`)
  - `GET/PATCH/DELETE /transactions/:id`
- **Users:** CQRS внутри, снаружи Auth.

Типы/DTO: `packages/shared`. Unit-тесты: Jest (`pnpm test` из корня).

## Окружение

- `backend/.env` — `PORT`, `DATABASE_URL`, `JWT_SECRET` (≥ 8), `JWT_EXPIRES_IN`; опционально `CORS_ORIGIN`, `NODE_ENV` (см. `backend/.env.example`).
