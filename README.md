# Expense Tracker

Монорепозиторий трекера расходов.

## Стек

- **Монорепо:** Turborepo + pnpm workspaces
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** NestJS, TypeScript, REST + Swagger (OpenAPI)
- **БД / ORM:** PostgreSQL + Prisma

## Структура

```
expence-tracker/
├── frontend/       # Next.js приложение
├── backend/        # NestJS приложение
└── packages/
    ├── shared/          # общие типы и DTO (@expense-tracker/shared)
    ├── tsconfig/        # общие tsconfig-пресеты
    └── eslint-config/   # общий ESLint конфиг
```

## Запуск

1. Установить зависимости:

   ```bash
   pnpm install
   ```

2. Скопировать файлы окружения:

   ```bash
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

3. Поднять PostgreSQL (локально или в Docker) и указать `DATABASE_URL` в `backend/.env`.

4. Сгенерировать Prisma Client и применить миграции:

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

5. Запустить всё в dev-режиме:

   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Swagger: http://localhost:4000/docs

## Авторизация

- `POST /auth/register`, `POST /auth/login` — возвращают `{ accessToken, user }`. Пароль хэшируется bcrypt, хранится в `User.password`.
- Для доступа к защищённым роутам добавь `@UseGuards(JwtAuthGuard)` (`backend/src/auth/guards/`) и бери пользователя через `@CurrentUser()` (`backend/src/auth/decorators/`).
- `backend/src/users/` и `backend/src/auth/` общаются только через `CommandBus`/`QueryBus` (`@nestjs/cqrs`), без прямых импортов сервисов между модулями — держи этот паттерн при добавлении новых межмодульных вызовов.
- Секреты: `JWT_SECRET`, `JWT_EXPIRES_IN` в `backend/.env` (см. `backend/.env.example`).
