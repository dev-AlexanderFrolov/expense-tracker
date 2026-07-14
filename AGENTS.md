# AGENTS.md

Контекст проекта для AI-агентов. Читай этот файл перед работой, чтобы не изучать проект заново.

При работе в конкретном воркспейсе дополнительно читай вложенные инструкции:

- **[frontend/AGENTS.md](./frontend/AGENTS.md)** — Next.js, FSD-архитектура, UI, клиентский стейт и API-клиент
- **[backend/AGENTS.md](./backend/AGENTS.md)** — NestJS, Prisma, модули API, тесты и безопасность

## Что это

Expense Tracker — трекер расходов. Монорепозиторий на **Turborepo + pnpm workspaces**.

Важно: это заготовка (scaffold), бизнес-логика добавляется постепенно. Реализованные модули — см. вложенные `AGENTS.md` в `frontend/` и `backend/`.

## Стек

- **Монорепо:** Turborepo + pnpm (workspaces: `frontend`, `backend`, `packages/*`)
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui — подробности в [frontend/AGENTS.md](./frontend/AGENTS.md)
- **Backend:** NestJS 11, REST + Swagger (`/docs`), TypeScript 5, PostgreSQL 17 + Prisma 6 — подробности в [backend/AGENTS.md](./backend/AGENTS.md)
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

- Общие типы и DTO — только в `packages/shared` (импорт как `@expense-tracker/shared`). Не дублируй интерфейсы между frontend и backend.
- Каждый воркспейс расширяет общий tsconfig (`@expense-tracker/tsconfig/*`) и ESLint (`@expense-tracker/eslint-config`). Не создавай локальные копии этих конфигов.
- Prisma-схема одна: `backend/prisma/schema.prisma`. Модели маппятся на snake_case таблицы (`@@map`).
- Форматирование: Prettier (2 пробела, LF, см. `.editorconfig`).

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

## Ветки (GitHub Flow)

Используем **[GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)**: `main` всегда деплоится/стабильна, вся работа — через короткоживущие feature-ветки и Pull Request.

- `main` — защищённая ветка, прямые коммиты в неё запрещены. Изменения попадают туда только через PR.
- Для новой задачи/фичи создавай отдельную ветку от актуального `main`: `git checkout main && git pull && git checkout -b <тип>/<короткое-описание>`.
- Именование веток: `<тип>/<kebab-case-описание>` на английском, тип соответствует типам коммитов (`feature`, `fix`, `refactor`, `chore`, `docs`). Пример: `feature/frontend-main-screen`.
- Одна ветка — одна логическая фича/задача. Не смешивать несколько несвязанных изменений в одной ветке.
- По завершении работы — открыть PR в `main` (см. раздел «Pull Request» ниже), после ревью/проверок слить (предпочтительно squash) и удалить ветку.
- Периодически подтягивать `main` в свою ветку (`git merge main` или `git rebase main`), чтобы избежать больших конфликтов.

## Pull Request

Перед созданием PR обязательно изучи полный diff ветки относительно `main` (`git diff main...HEAD`, `git log main..HEAD`), а не только последний коммит.

- **Title** — в формате Conventional Commits: `<type>(<scope>): <описание>` (на русском, повелительное наклонение, без точки). Scope опционален; title должен отражать суть всего PR, а не один коммит из середины ветки.
- **Body** — информативное описание на русском, минимум:
  - **Summary** — 1–3 пункта: что реализовано / зачем (фичи UI, изменения API, миграции, infra).
  - Для backend: перечисли затронутые/добавленные эндпоинты и breaking changes контракта (например смена ответа `GET /transactions` на `PaginatedResult`).
  - Для frontend: какие экраны/сценарии появились и на какие API опираются.
  - **Test plan** — чеклист ручной/автоматической проверки.
- Создавай PR через `gh pr create` (после `git push -u origin HEAD`, если ветка ещё не на remote).
- Base branch — всегда `main`. Не пушь в `main` напрямую.

## Коммиты

Используем **[Conventional Commits](https://www.conventionalcommits.org/)**: `<type>(<scope>): <описание>`.

- `type`: `feat` (новая функциональность), `fix` (исправление бага), `refactor`, `chore` (конфиги/зависимости/инфра), `docs`, `style` (форматирование, без логики), `test`.
- `scope` — затронутая область: `backend`, `frontend`, `shared`, `prisma`, либо конкретный модуль (`auth`, `categories`, `transactions`).
- Описание — на русском, в повелительном наклонении, без точки на конце (`добавь`, `исправь`, а не `добавил`/`добавлено`).
- Один коммит — одно логическое изменение; не смешивать несвязанные фичи в одном коммите.

## Окружение

- `backend/.env` — см. [backend/AGENTS.md](./backend/AGENTS.md)
- `frontend/.env.local` — см. [frontend/AGENTS.md](./frontend/AGENTS.md)
- `.env` файлы в git не коммитятся (в т.ч. `.env.production`, `.env.staging`).
