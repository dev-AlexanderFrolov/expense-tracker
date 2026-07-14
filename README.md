# Expense Tracker

Трекер расходов и доходов. Монорепозиторий на **Turborepo + pnpm workspaces**: Next.js-фронт, NestJS-бэкенд, общая PostgreSQL-база.

Проект всё ещё развивается (scaffold + базовая бизнес-логика). Уже работают: регистрация/логин, категории, транзакции со сводкой по месяцу и UI для dashboard/категорий.

## Стек

| Слой | Технологии |
|------|------------|
| Монорепо | Turborepo, pnpm 9 workspaces |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query, react-hook-form + zod |
| Backend | NestJS 11, REST + Swagger, Prisma 6, JWT (passport), CQRS (`@nestjs/cqrs`), helmet, throttler |
| БД | PostgreSQL 17 |
| Shared | `@expense-tracker/shared` — общие типы и DTO |

**Node.js ≥ 22**, пакетный менеджер — **pnpm 9**.

## Требования

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9 (`corepack enable` или установка вручную)
- [Docker](https://www.docker.com/) (рекомендуется для PostgreSQL) либо локальный PostgreSQL 17

## Быстрый старт

```bash
# 1. Зависимости
pnpm install

# 2. Переменные окружения
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# 3. PostgreSQL
docker compose up -d

# 4. Prisma Client + миграции
pnpm prisma:generate
pnpm prisma:migrate

# 5. Dev-режим (frontend + backend)
pnpm dev
```

После запуска:

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Swagger (только не-production) | http://localhost:4000/docs |

## Переменные окружения

Файлы `.env` / `.env.local` / `.env.production` / `.env.staging` **не коммитятся**. Шаблоны — в `.env.example`.

### Backend (`backend/.env`)

| Переменная | Обязательная | Описание | Пример |
|------------|--------------|----------|--------|
| `PORT` | нет | Порт HTTP-сервера (по умолчанию `4000`) | `4000` |
| `DATABASE_URL` | да | Строка подключения Prisma/PostgreSQL | `postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public` |
| `JWT_SECRET` | да | Секрет подписи JWT (**≥ 8 символов**, иначе приложение не стартует) | `change-me-dev-secret` |
| `JWT_EXPIRES_IN` | нет | Время жизни access-токена | `1d` |
| `CORS_ORIGIN` | нет | Разрешённые origin через запятую. Если не задан — CORS открыт для всех | `http://localhost:3000` |
| `NODE_ENV` | нет | `production` отключает Swagger (`/docs`) | `development` |

Минимальный `backend/.env` для локальной разработки (совпадает с `docker-compose.yml`):

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public"
JWT_SECRET="change-me-dev-secret"
JWT_EXPIRES_IN="1d"
# CORS_ORIGIN=http://localhost:3000
```

Docker Compose поднимает БД с учёткой `postgres` / `postgres`, база `expense_tracker`, порт `5432`.

### Frontend (`frontend/.env.local`)

| Переменная | Обязательная | Описание | Пример |
|------------|--------------|----------|--------|
| `NEXT_PUBLIC_API_URL` | да | Базовый URL backend API (доступен в браузере) | `http://localhost:4000` |

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Структура проекта

```
expence-tracker/
├── frontend/                 # Next.js (порт 3000), Feature-Sliced Design
│   └── src/
│       ├── app/              # App Router, провайдеры, auth-effects
│       ├── views/            # страницы: legal, dashboard, categories, profile
│       ├── widgets/          # app-layout (сайдбар, auth-guard, logout)
│       ├── features/         # auth, transactions, categories
│       ├── entities/         # user, transaction, category
│       └── shared/           # API-клиент, shadcn ui, config
├── backend/                  # NestJS (порт 4000)
│   ├── src/
│   │   ├── auth/             # register/login, JwtAuthGuard, @CurrentUser()
│   │   ├── users/            # CQRS (внутренний модуль)
│   │   ├── categories/       # Controller → Service → Repository
│   │   ├── transactions/     # CQRS + фильтры + summary
│   │   └── prisma/           # PrismaModule (@Global), exception filter
│   └── prisma/schema.prisma  # User, Category, Transaction
├── packages/
│   ├── shared/               # @expense-tracker/shared
│   ├── tsconfig/             # общие tsconfig-пресеты
│   └── eslint-config/        # общий flat ESLint-конфиг
├── docker-compose.yml        # PostgreSQL 17
├── turbo.json
└── pnpm-workspace.yaml
```

## API

Интерактивная документация: **http://localhost:4000/docs** (Swagger, Bearer JWT).

Все защищённые эндпоинты требуют заголовок:

```http
Authorization: Bearer <accessToken>
```

### Auth

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/auth/register` | нет | Регистрация → `{ accessToken, user }` |
| `POST` | `/auth/login` | нет | Вход → `{ accessToken, user }` |

Пароль хэшируется bcrypt. На `/auth/*` действует rate limiting (throttler).

### Categories (JWT)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/categories` | Создать категорию |
| `GET` | `/categories` | Список категорий текущего пользователя |
| `PATCH` | `/categories/:id` | Обновить |
| `DELETE` | `/categories/:id` | Удалить |

Уникальность имени в рамках пользователя → `409`. Чужой ресурс → `404`.

### Transactions (JWT)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/transactions` | Создать транзакцию |
| `GET` | `/transactions` | Список с фильтрами и пагинацией |
| `GET` | `/transactions/summary` | Сводка за месяц (`month`, `year` обязательны) |
| `GET` | `/transactions/:id` | Одна транзакция |
| `PATCH` | `/transactions/:id` | Обновить |
| `DELETE` | `/transactions/:id` | Удалить |

Query-параметры списка:

- фильтры: `dateFrom`, `dateTo`, `type` (`INCOME` \| `EXPENSE`), `categoryId`
- пагинация: `page` (по умолчанию `1`), `limit` (по умолчанию `10`, максимум `100`)
- ответ: `PaginatedResult<Transaction>`

### Модели данных (Prisma)

- **User** — email, name, password, role
- **Category** — name, icon?, color?; unique `[userId, name]`
- **Transaction** — amount, type (`INCOME` \| `EXPENSE`), description?, date, categoryId, userId

## Frontend: экраны

| Маршрут | Назначение |
|---------|------------|
| `/login`, `/register` | Авторизация; JWT в `localStorage`, состояние в Zustand |
| `/` | Dashboard: список транзакций + создание |
| `/categories` | Список и создание категорий (edit/delete пока нет) |
| `/profile` | Заглушка профиля + logout |
| `/terms`, `/privacy` | Юридические страницы |

Защищённые маршруты обёрнуты в `widgets/app-layout` (auth-guard). При `401` — logout и редирект на `/login`.

## Команды

Все команды — **из корня** монорепо:

```bash
pnpm install            # зависимости
docker compose up -d    # PostgreSQL
pnpm prisma:generate    # Prisma Client
pnpm prisma:migrate     # миграции (интерактивно в dev)
pnpm dev                # frontend + backend
pnpm lint               # ESLint
pnpm typecheck          # проверка типов
pnpm test               # unit-тесты backend (Jest)
pnpm build              # production-сборка
pnpm format             # Prettier
```

Запуск только одного приложения:

```bash
pnpm --filter frontend dev
pnpm --filter backend dev
```

## Соглашения

- Общие типы/DTO — только в `@expense-tracker/shared`, без дублирования между apps.
- tsconfig и ESLint — только из `@expense-tracker/tsconfig` и `@expense-tracker/eslint-config`.
- Одна Prisma-схема: `backend/prisma/schema.prisma`.
- Prettier: 2 пробела, LF (см. `.editorconfig`).
- Модули backend: Auth/Users/Transactions через CQRS или guard-паттерн; Categories — классический Service → Repository. Межмодульные вызовы — без прямых импортов сервисов между feature-модулями, где уже заложен CQRS.

Подробный контекст для разработки и AI-агентов: [`AGENTS.md`](./AGENTS.md), [`frontend/AGENTS.md`](./frontend/AGENTS.md), [`backend/AGENTS.md`](./backend/AGENTS.md). Правила кода — в [`.cursor/rules/`](./.cursor/rules/).
