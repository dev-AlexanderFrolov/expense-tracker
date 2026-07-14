# Гайд для разработчиков

Практическая шпаргалка: как поднять проект, куда класть код и какие соглашения соблюдать. Для онбординга людей и как справочник для AI-агентов.

## Требования

- Node.js **≥ 22**
- pnpm **9** (`packageManager` в корневом `package.json`)
- Docker (рекомендуется) или локальный PostgreSQL 17

## Быстрый старт

```bash
pnpm install

cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

docker compose up -d

pnpm prisma:generate
pnpm prisma:migrate

pnpm dev
```

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000 |
| Swagger | http://localhost:4000/docs |

Только одно приложение:

```bash
pnpm --filter frontend dev
pnpm --filter backend dev
```

## Переменные окружения

`.env*` в git **не коммитить**.

### `backend/.env` (обязательные поля валидируются при старте)

| Переменная | Обязательная | Заметки |
|------------|--------------|---------|
| `DATABASE_URL` | да | Prisma |
| `JWT_SECRET` | да | ≥ 8 символов |
| `JWT_EXPIRES_IN` | да (в `validateEnv`) | напр. `1d` |
| `PORT` | нет | default `4000` |
| `CORS_ORIGIN` | нет | CSV origin; без неё CORS открыт |
| `NODE_ENV` | нет | `production` скрывает Swagger |

### `frontend/.env.local`

| Переменная | Обязательная | Заметки |
|------------|--------------|---------|
| `NEXT_PUBLIC_API_URL` | да | Базовый URL API, напр. `http://localhost:4000` |

Подробнее — `README.md`, примеры — `*.env.example`.

## Частые команды (из корня)

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test                 # Jest, только backend
pnpm build
pnpm format
pnpm prisma:generate
pnpm prisma:migrate
docker compose up -d
```

## Куда класть код

### Shared

Любой новый интерфейс/enum, нужный и фронту, и бэку → `packages/shared/src/types/`, реэкспорт из `index.ts`.

Не дублировать DTO между apps.

### Backend

```
backend/src/<module>/
├── *.controller.ts
├── *.service.ts / handlers/
├── *.repository.ts
├── dto/                 # class-validator + Swagger
├── commands/ | queries/ # если CQRS
└── *.module.ts
```

Паттерны по модулям:

| Модуль | Паттерн |
|--------|---------|
| categories | Controller → Service → Repository |
| users, transactions | CQRS → service → repository |
| auth | Service + JwtAuthGuard |

Правила:

- Чужой ресурс → `404`, unique → `409`.
- После изменений методов: JSDoc; на контроллерах/DTO — Swagger-декораторы.
- `GET /transactions/summary` — объявлять до `:id`.
- Не импортировать `PrismaModule` повторно (он `@Global`).

См. `.cursor/rules/backend-nest.mdc`, `backend-prisma.mdc`.

### Frontend (FSD)

```
frontend/src/
├── app/          # роуты — тонкие
├── views/        # композиция страниц
├── widgets/
├── features/
├── entities/
└── shared/
```

- Импорты только `app → views → widgets → features → entities → shared`.
- Публичный API слайса — `index.ts`, без deep imports.
- Auth-стейт: Zustand. Серверные данные: TanStack Query. Формы: RHF + zod.
- UI-компоненты: shadcn (не изобретать параллельную систему).

См. `.cursor/rules/frontend-fsd.mdc`, `frontend-shadcn.mdc`.

## Чеклист новой фичи

1. Типы/DTO в `@expense-tracker/shared` (если нужны снаружи модуля).
2. Prisma (если нужна схема) → migrate + generate.
3. Backend: модуль/эндпоинты + тесты (`pnpm test`) + Swagger.
4. Frontend: entity/feature/view по FSD + Query-ключи и инвалидация.
5. Обновить `backend/AGENTS.md` / `frontend/AGENTS.md`, если добавились экраны или эндпоинты.
6. `pnpm lint && pnpm typecheck`.

## Git / PR

GitHub Flow. Ветки: `feature|fix|refactor|chore|docs/<kebab-case>` от актуального `main`.

Коммиты (Conventional Commits, описание на русском):

```
feat(transactions): добавь фильтр по категории
fix(auth): исправь обработку 401 на фронте
```

PR: Summary + Test plan; base `main`. Подробности — `.cursor/rules/git-workflow.mdc`.

## Документация и контекст для агентов

| Документ | Когда открывать |
|----------|-----------------|
| [architecture.md](./architecture.md) | Структура системы, паттерны модулей |
| [api.md](./api.md) | Контракты эндпоинтов |
| [database.md](./database.md) | Поля Prisma и смысл колонок |
| `README.md` | Быстрый старт для человека |
| `AGENTS.md` (+ workspace) | Актуальный статус модулей/экранов |
| `.cursor/rules/*.mdc` | Правила при правках кода |
| `.cursor/plans/*` | Сохранённые планы фич |
| `.cursor/prompts/*` | Заготовки промптов команды |

## Известные нюансы

- JWT на фронте в `localStorage` — риск XSS; для production рассмотреть httpOnly cookie + refresh.
- Edit/delete категорий в UI ещё не сделаны (API уже есть).
- Profile `/profile` — заглушка.
- Swagger отключается в `production`.
- Модель `Expense` удалена — не возвращать.

## Типичные проблемы

| Симптом | Что проверить |
|---------|----------------|
| Backend не стартует | `JWT_SECRET` ≥ 8, `DATABASE_URL`, `JWT_EXPIRES_IN` заданы |
| Prisma Client устарел | `pnpm prisma:generate` |
| CORS ошибки с фронта | `CORS_ORIGIN=http://localhost:3000` или оставить unset |
| `409` при удалении категории | Есть связанные transactions |
| `404` на «свою» категорию в транзакции | `categoryId` от другого пользователя |
| `429` на login/register | Лимиты 10/5 в минуту |
