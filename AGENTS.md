# AGENTS.md

Контекст проекта для AI-агентов. Читай этот файл перед работой, чтобы не изучать проект заново.

При работе в конкретном воркспейсе дополнительно читай:

- **[frontend/AGENTS.md](./frontend/AGENTS.md)** — экраны, auth UI, маршруты, env
- **[backend/AGENTS.md](./backend/AGENTS.md)** — эндпоинты модулей, Prisma-модели, env
- **[.cursor/rules/](./.cursor/rules/)** — триггерные правила кода (FSD, Nest, Prisma, git, code review)

## Что это

Expense Tracker — трекер расходов. Монорепозиторий на **Turborepo + pnpm workspaces**.

Важно: это заготовка (scaffold), бизнес-логика добавляется постепенно. Реализованные модули — в воркспейс-`AGENTS.md`.

## Стек

- **Монорепо:** Turborepo + pnpm (`frontend`, `backend`, `packages/*`)
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui
- **Backend:** NestJS 11, REST + Swagger (`/docs`), TypeScript 5, PostgreSQL 17 + Prisma 6
- **Node:** 22 LTS, пакетный менеджер — pnpm 9

## Структура

```
expence-tracker/
├── frontend/            # Next.js (порт 3000) — см. frontend/AGENTS.md
├── backend/             # NestJS (порт 4000, Swagger /docs) — см. backend/AGENTS.md
├── packages/
│   ├── shared/          # @expense-tracker/shared — общие типы/DTO
│   ├── tsconfig/        # @expense-tracker/tsconfig — base/nextjs/nestjs пресеты
│   └── eslint-config/   # @expense-tracker/eslint-config — общий flat ESLint конфиг
├── docker-compose.yml   # PostgreSQL 17 (postgres/postgres, db: expense_tracker)
├── turbo.json           # задачи: dev, build, lint, typecheck
└── pnpm-workspace.yaml
```

## Соглашения

Базовые запреты и правила монорепо — в `.cursor/rules/project-core.mdc` (alwaysApply). Кратко:

- типы/DTO только в `@expense-tracker/shared`
- tsconfig/ESLint только из общих пакетов
- одна Prisma-схема: `backend/prisma/schema.prisma`
- Prettier: 2 пробела, LF (см. `.editorconfig`)
- git/PR/коммиты — `.cursor/rules/git-workflow.mdc`

## Команды

Все запускаются из корня через Turborepo:

```bash
pnpm install            # установка зависимостей
docker compose up -d    # поднять PostgreSQL
pnpm prisma:generate    # сгенерировать Prisma Client
pnpm prisma:migrate     # применить миграции
pnpm dev                # запустить frontend + backend
pnpm lint               # ESLint по всем воркспейсам
pnpm typecheck          # проверка типов
pnpm test               # unit-тесты backend (Jest)
pnpm build              # production-сборка
```

## Окружение

- `backend/.env` — см. [backend/AGENTS.md](./backend/AGENTS.md)
- `frontend/.env.local` — см. [frontend/AGENTS.md](./frontend/AGENTS.md)
- `.env` файлы в git не коммитятся (в т.ч. `.env.production`, `.env.staging`).

## Актуализация документации

После изменения любых методов необходимо актуализировать или добавить JSdoc, а для DTO и контроллеров — добавить декораторы Swagger.
