# Архитектура

Expense Tracker — монорепозиторий трекера расходов и доходов. Бизнес-логика добавляется постепенно; ниже — актуальное состояние системы.

## Обзор

```
┌─────────────────┐     JWT Bearer      ┌─────────────────┐     Prisma      ┌──────────────┐
│  frontend       │ ──────────────────► │  backend        │ ──────────────► │  PostgreSQL  │
│  Next.js :3000  │ ◄────────────────── │  NestJS :4000   │ ◄────────────── │  :5432       │
└────────┬────────┘                     └────────┬────────┘                 └──────────────┘
         │                                        │
         └──────── @expense-tracker/shared ───────┘
                   (типы / DTO-интерфейсы)
```

| Компонент | Технологии | Порт |
|-----------|------------|------|
| Frontend | Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui | 3000 |
| Backend | NestJS 11, REST, Swagger `/docs`, Prisma 6 | 4000 |
| БД | PostgreSQL 17 (`docker-compose.yml`) | 5432 |
| Shared | `@expense-tracker/shared` | — |

## Монорепо

```
expence-tracker/
├── frontend/                 # Next.js (FSD)
├── backend/                  # NestJS
├── packages/
│   ├── shared/               # общие типы и DTO-интерфейсы
│   ├── tsconfig/             # пресеты base / nextjs / nestjs
│   └── eslint-config/        # общий flat ESLint
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

- Оркестрация задач: **Turborepo** + **pnpm 9** workspaces.
- Команды запускаются **из корня** (`pnpm dev`, `pnpm lint`, …).
- Типы/DTO-интерфейсы — **только** в `@expense-tracker/shared`. Классы с `class-validator` / Swagger — в `backend/src/<module>/dto`.
- tsconfig и ESLint — только из общих пакетов, без локальных копий.

## Backend

### Модули

| Модуль | Паттерн | Ответственность |
|--------|---------|-----------------|
| `auth` | Service + Guards | `register` / `login`, JWT, `JwtAuthGuard`, `@CurrentUser()` |
| `users` | CQRS | создание/поиск пользователей; наружу не экспонируется REST |
| `categories` | Controller → Service → Repository | CRUD категорий пользователя |
| `transactions` | CQRS (CommandBus / QueryBus) | CRUD, фильтры, пагинация, месячная сводка |
| `prisma` | `@Global` | `PrismaService`, `PrismaExceptionFilter` |
| `config` | `ConfigModule` + `validateEnv` | валидация env при старте |

Связи между модулями:

- Auth ↔ Users — через CQRS (`CommandBus` / `QueryBus`), без прямого импорта сервисов.
- Transactions при create/update проверяет, что `categoryId` принадлежит текущему пользователю (через `CategoriesService` / owned-check).
- Чужой ресурс → `404`; unique-конфликт → `409` (в т.ч. через `PrismaExceptionFilter` для P2002/P2003).

### Слои внутри модуля

```
Controller  →  (CommandBus | QueryBus | Service)
                    ↓
                 Service / Handler
                    ↓
                 Repository
                    ↓
                 PrismaService
```

### Hardening

- `helmet` на HTTP.
- Глобальный `ThrottlerGuard` (100 req / 60s); на `/auth/register` — 5/мин, на `/auth/login` — 10/мин.
- Глобальный `ValidationPipe`: `whitelist`, `transform`, `forbidNonWhitelisted`.
- Swagger доступен только если `NODE_ENV !== production`.
- `JWT_SECRET` ≥ 8 символов (валидация при старте).

### Auth-поток

1. `POST /auth/register` или `POST /auth/login` → `{ accessToken, user }`.
2. Пароль хэшируется bcrypt, хранится в `User.password`.
3. Клиент кладёт JWT в `Authorization: Bearer …` и (на фронте) в `localStorage`.
4. Защищённые роуты: `@UseGuards(JwtAuthGuard)` + `@CurrentUser()`.

## Frontend

### Feature-Sliced Design

Слои в `frontend/src/` (импорты только сверху вниз):

```
app → views → widgets → features → entities → shared
```

| Слой | Назначение |
|------|------------|
| `app/` | App Router, провайдеры, `auth-effects` (401 → logout) |
| `views/` | Композиция страниц (не `pages/` — конфликт с Pages Router) |
| `widgets/` | `app-layout`: сайдбар, auth-guard, logout |
| `features/` | `auth/*`, `transactions/*`, `categories/*` |
| `entities/` | `user`, `transaction`, `category` |
| `shared/` | API-клиент, shadcn ui, lib, config, providers |

Правила:

- Горизонтальные импорты между слайсами одного слоя запрещены.
- Публичный API слайса — только через корневой `index.ts`.
- Роуты в `app/` — тонкие обёртки; UI страницы — в `views/*`.

### Клиентский стек

| Задача | Решение |
|--------|---------|
| Auth-состояние | Zustand (`entities/user`) |
| Серверные данные | TanStack Query |
| Формы | react-hook-form + zod |
| UI | shadcn/ui (new-york, neutral) + Tailwind v4 |

### Маршруты

| Путь | Тип | Содержимое |
|------|-----|------------|
| `/login`, `/register` | публичные | auth forms |
| `/`, `/categories`, `/profile` | protected (`app/(app)`) | dashboard, категории, профиль |
| `/terms`, `/privacy` | публичные | legal |

## Shared-пакет

`packages/shared` экспортирует:

- `User`, `CreateUserDto`, `LoginDto`, `AuthResponse`, `JwtPayload`
- `Category`, `CreateCategoryDto`, `UpdateCategoryDto`
- `Transaction`, `TransactionType`, CRUD/query/summary DTO, `PaginatedResult`, `TransactionSummary`

Frontend и backend импортируют одни и те же интерфейсы; runtime-валидация — только на backend (`class-validator`).

## Данные

Одна Prisma-схема: `backend/prisma/schema.prisma`.

```
User 1──* Category 1──* Transaction
User 1────────────────* Transaction
```

Подробности полей — в [database.md](./database.md). API — в [api.md](./api.md).

## Документация проекта

| Файл | Назначение |
|------|------------|
| `README.md` | Быстрый старт для разработчика |
| `AGENTS.md`, `frontend/AGENTS.md`, `backend/AGENTS.md` | Контекст для AI и команды |
| `.cursor/rules/*.mdc` | Триггерные правила кода |
| `.cursor/docs/*` | Эта папка: архитектура, API, БД, гайд |
