# AGENTS.md

Контекст проекта для AI-агентов. Читай этот файл перед работой, чтобы не изучать проект заново.

## Что это

Expense Tracker — трекер расходов. Монорепозиторий на **Turborepo + pnpm workspaces**.

Важно: это заготовка (scaffold), бизнес-логика добавляется постепенно. Реализованные модули backend — см. раздел «Реализованные модули».

## Стек

- **Монорепо:** Turborepo + pnpm (workspaces: `frontend`, `backend`, `packages/*`)
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui (new-york, neutral), архитектура — **Feature-Sliced Design** (см. раздел ниже)
  - Состояние/данные: Zustand (клиентский стейт, напр. auth) + TanStack Query (запросы к API)
  - Формы: react-hook-form + zod
- **Backend:** NestJS 11, REST + Swagger (`/docs`), TypeScript 5
- **БД / ORM:** PostgreSQL 17 + Prisma 6
- **Node:** 22 LTS, пакетный менеджер — pnpm 9

## Структура

```
expence-tracker/
├── frontend/            # Next.js приложение (порт 3000), FSD-архитектура — см. раздел «Frontend: Feature-Sliced Design»
│   └── src/
│       ├── app/         # Next.js App Router = FSD-слой app (routing, layout, providers, globals.css)
│       ├── views/       # FSD-слой pages (композиция страниц; назван `views`, а не `pages`, чтобы не конфликтовать с Pages Router Next.js). Слайсы: `legal` (статичные `/terms`, `/privacy`), `dashboard`, `categories`, `profile`
│       ├── widgets/      # FSD-слой widgets: `app-layout` — защищённая оболочка (`/`, `/categories`, `/profile`) с сайдбар-меню, auth-guard и logout
│       ├── features/     # FSD-слой features (пользовательские сценарии, напр. auth/login)
│       ├── entities/     # FSD-слой entities (бизнес-сущности, напр. user)
│       └── shared/        # FSD-слой shared (api-клиент, ui из shadcn, lib, config, providers)
├── backend/             # NestJS приложение (порт 4000, Swagger на /docs)
│   ├── src/main.ts      # bootstrap: CORS + ValidationPipe + Swagger
│   ├── src/app.module.ts
│   ├── src/prisma/      # PrismaModule (@Global) + PrismaService
│   ├── src/auth/        # регистрация/логин, JwtAuthGuard, @CurrentUser()
│   ├── src/users/       # CQRS (CreateUser/GetUserByEmail/GetUserById)
│   ├── src/categories/  # CRUD категорий (repository → service → controller)
│   ├── src/transactions/ # CRUD + фильтры + summary по транзакциям (CQRS, как Users)
│   └── prisma/schema.prisma  # модели User, Category, Expense, Transaction
├── packages/
│   ├── shared/          # @expense-tracker/shared — общие типы/DTO
│   ├── tsconfig/        # @expense-tracker/tsconfig — base/nextjs/nestjs пресеты
│   └── eslint-config/   # @expense-tracker/eslint-config — общий flat ESLint конфиг
├── docker-compose.yml   # PostgreSQL 17 (postgres/postgres, db: expense_tracker)
├── turbo.json           # задачи: dev, build, lint, typecheck
└── pnpm-workspace.yaml
```

## Реализованные модули

- **Auth** (`backend/src/auth`): `POST /auth/register`, `POST /auth/login` — выдают `accessToken` (JWT) + `user`. `JwtAuthGuard` + `@CurrentUser()` — для защиты остальных эндпоинтов.
- **Users** (`backend/src/users`): CQRS (команды/запросы), используется из `Auth`.
- **Categories** (`backend/src/categories`): CRUD категорий трат, требует `JwtAuthGuard`.
  - `POST /categories`, `GET /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`.
  - Изоляция по пользователю: чужая категория → `404`; дубликат имени (`@@unique([userId, name])`) → `409`.
  - Архитектура: прямой инжект `Controller -> Service -> Repository` (без CQRS, в отличие от `Users`).
  - DTO (`CreateCategoryDto`/`UpdateCategoryDto`) — в `packages/shared` + класс-валидаторы в `backend/src/categories/dto`.
- **Transactions** (`backend/src/transactions`): учёт доходов/расходов, требует `JwtAuthGuard`.
  - `POST /transactions`, `GET /transactions` (фильтры `dateFrom`/`dateTo`/`type`/`categoryId` + пагинация `page`/`limit`, дефолт 1/10, ответ `PaginatedResult<Transaction>`), `GET /transactions/summary` (агрегация по `month`+`year`, оба обязательны), `GET /transactions/:id`, `PATCH /transactions/:id`, `DELETE /transactions/:id`. Маршрут `summary` объявлен до `:id`.
  - Архитектура: CQRS (`CommandBus`/`QueryBus` в контроллере, хендлеры → `TransactionsService` → `TransactionsRepository`), по образцу `Users`.
  - Изоляция по пользователю через `findOwnedOrThrow` (как в `Categories`); `amount` — `Decimal(12,2)` → `number`, даты → ISO-строки.
  - Типы/DTO (`Transaction`, `Create/UpdateTransactionDto`, `TransactionSummary`) — в `packages/shared`.
- **Auth UI** (`frontend`): страницы `/login` и `/register`, построены на shadcn/ui (`Form`, `Input`, `Button`, `Card`, `Alert`, `Checkbox`).
  - Формы с валидацией react-hook-form + zod (`features/auth/login`, `features/auth/register`).
  - Успешный логин/регистрация → `AuthResponse` кладётся в Zustand-стор `entities/user` (персист в `localStorage`) и токен подставляется во все запросы `shared/api/client`; редирект на `/` (главный экран).
  - Регистрация требует чекбокс согласия с условиями (`agreeToTerms` в `features/auth/register/model/schema.ts`, только фронтовая валидация, в `CreateUserDto` на backend не передаётся). Ссылки внутри лейбла ведут на статичные страницы `/terms` и `/privacy` (слайс `views/legal`), открываются в той же вкладке (без `target="_blank"`).
- **Главный экран** (`frontend`): route group `app/(app)` (маршруты `/`, `/categories`, `/profile`) под общим защищённым layout `widgets/app-layout` — auth-guard редиректит неавторизованных на `/login`, сайдбар (shadcn `Sidebar`) с меню и профилем/logout.
  - `/` → `views/dashboard` + `features/transactions/list`: таблица транзакций постранично (10/стр) через `useQuery` (`entities/transaction`, `keepPreviousData`), категория подтягивается отдельным запросом (`entities/category`) и джойнится на клиенте по `categoryId`.
  - Создание транзакции — `features/transactions/create`: диалог (shadcn `Dialog` + `Select`) с формой (react-hook-form + zod), `POST /transactions` через `useMutation`, при успехе инвалидирует `transactionKeys.all`. Категория выбирается из существующих (`GET /categories`); при отсутствии категорий сабмит заблокирован.
  - `/categories` → `views/categories`: список категорий (`Badge`) + создание через `features/categories/create` (диалог с именем, `POST /categories`, инвалидация `categoryKeys.all`); редактирование/удаление — отдельная задача.
  - `/profile` — минимальная заглушка (`views/profile`). Выход из аккаунта: текстовая кнопка в карточке профиля (`LogoutButton`) + иконка `LogoutIconButton` (lucide `LogOut`) в футере сайдбара рядом с именем пользователя.

## Frontend: Feature-Sliced Design

Frontend построен по методологии **[Feature-Sliced Design](https://feature-sliced.design)**. Слои располагаются в `frontend/src/*`, импорты — только «сверху вниз» (`app → views → widgets → features → entities → shared`), горизонтальные импорты между слайсами одного слоя запрещены.

- **`app/`** — совпадает с Next.js App Router (`layout.tsx`, `page.tsx`, `globals.css`, роуты `login/page.tsx`, `register/page.tsx`). Здесь же глобальные провайдеры (`QueryProvider`, `Toaster`). Роуты — тонкие обёртки, рендерят компонент из `views/*`.
- **`views/`** — FSD-слой `pages` (композиция страницы из виджетов/фич). Назван `views`, а не `pages`, **намеренно** — папка `src/pages` конфликтует с Pages Router Next.js (Next пытается роутить её как старый роутер, страницы App Router перестают резолвиться). Каждый слайс: `views/<name>/ui/*.tsx` + `views/<name>/index.ts` (публичный API).
- **`widgets/`** — самостоятельные композитные блоки UI, которые переиспользуются на разных страницах. Пример: `widgets/app-layout` (сайдбар-меню + auth-guard для защищённых страниц).
- **`features/`** — пользовательские сценарии/фичи. Пример: `features/auth/login`, `features/auth/register`, `features/auth/logout`. Внутри слайса — подпапки `ui/` (компоненты), `model/` (хуки, zod-схемы, состояние фичи), `api/` (запросы к backend).
- **`entities/`** — бизнес-сущности. Пример: `entities/user` — Zustand-стор авторизации (`model/store.ts`) с персистом в `localStorage`.
- **`shared/`** — код без привязки к бизнес-логике: `shared/ui` (компоненты shadcn/ui, `components.json` настроен на алиасы `@/shared/*`), `shared/lib` (утилиты, `cn()`), `shared/api` (fetch-клиент `apiRequest`/`ApiError`, хранение JWT в памяти), `shared/config` (переменные окружения), `shared/hooks`, `shared/providers` (TanStack Query provider).

Правила слайсов:

- Публичный API слайса — только через `index.ts` в его корне (`export { X } from "./ui/x"`), импортировать напрямую из внутренних файлов слайса снаружи нельзя.
- Каждый слайс/сегмент — папка `ui/`, `model/`, `api/` (только те, что нужны).
- Новые сущности/фичи добавляются как отдельные слайсы, а не расширением существующих файлов.

### Подводные камни shadcn/ui в этом проекте

- `npx shadcn add <component>` **не обновляет** `globals.css` под уже настроенные `cssVariables: true`. Если в `globals.css` нет полного набора токенов (`--primary`, `--destructive`, `--border`, `--input`, `--muted-foreground` и т.д. + `@theme inline` + `.dark`), то классы типа `bg-primary`/`text-destructive` не генерируются, и вёрстка выглядит «сломанной» (не те цвета/чёрный фон). Актуальный полный набор токенов уже лежит в `frontend/src/app/globals.css` — при добавлении новых компонентов проверяй, что они не приносят токены, которых там нет.
- Компонент `Label` (и, соответственно, `FormLabel`) из коробки имеет базовый класс `flex`. Это ок для лейбла с иконкой, но **ломает перенос текста**, если внутри лейбла обычный параграф с несколькими inline-ссылками (каждая ссылка/текстовый узел становится отдельным flex-item и переносится как своя колонка). Для текста с несколькими инлайновыми ссылками переопределяй display на `inline` через className (например `className="inline ..."` — tailwind-merge корректно перекрывает `flex`).
- `FormLabel` подсвечивает текст красным (`data-[error=true]:text-destructive`), а инпуты/чекбоксы — красной рамкой (`aria-invalid:border-destructive`) автоматически при ошибке валидации поля. Если по дизайну красным должен быть только текст `FormMessage` (как договорились для чекбокса согласия), нужно явно перекрывать через className: `data-[error=true]:text-foreground` на `FormLabel` и `aria-invalid:border-input aria-invalid:ring-0` на контроле.

### Известные инфраструктурные фиксы

- **`pnpm lint` (frontend) падал** с `Converting circular structure to JSON` — конфиг подключал правила Next через устаревший `FlatCompat.extends("next/core-web-vitals")`, несовместимый с ESLint 9/Next 16. Исправлено: `frontend/eslint.config.mjs` подключает `@next/eslint-plugin-next` напрямую как flat-config плагин.
- **Backend не стартовал** (`ERR_MODULE_NOT_FOUND` при `require("@expense-tracker/shared")`) — пакет отдавал сырой `.ts` с `"type": "module"`, а Node в CommonJS-сборке backend не резолвил ESM-импорты без расширений. Исправлено: `packages/shared` теперь собирается в CommonJS (`pnpm build` → `dist/`), `main`/`types` указывают на `dist`; `turbo.json` подтягивает сборку shared перед `dev`.

## Соглашения

- Общие типы и DTO — только в `packages/shared` (импорт как `@expense-tracker/shared`). Не дублируй интерфейсы между frontend и backend.
- Каждый воркспейс расширяет общий tsconfig (`@expense-tracker/tsconfig/*`) и ESLint (`@expense-tracker/eslint-config`). Не создавай локальные копии этих конфигов.
- Prisma-схема одна: `backend/prisma/schema.prisma`. Модели маппятся на snake_case таблицы (`@@map`).
- `PrismaService` глобальный — инжектится в любой модуль без повторного импорта `PrismaModule`.
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
pnpm build              # production-сборка
```

## Ветки (GitHub Flow)

Используем **[GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)**: `main` всегда деплоится/стабильна, вся работа — через короткоживущие feature-ветки и Pull Request.

- `main` — защищённая ветка, прямые коммиты в неё запрещены. Изменения попадают туда только через PR.
- Для новой задачи/фичи создавай отдельную ветку от актуального `main`: `git checkout main && git pull && git checkout -b <тип>/<короткое-описание>`.
- Именование веток: `<тип>/<kebab-case-описание>` на английском, тип соответствует типам коммитов (`feature`, `fix`, `refactor`, `chore`, `docs`). Пример: `feature/frontend-main-screen`.
- Одна ветка — одна логическая фича/задача. Не смешивать несколько несвязанных изменений в одной ветке.
- По завершении работы — открыть PR в `main`, после ревью/проверок слить (предпочтительно squash) и удалить ветку.
- Периодически подтягивать `main` в свою ветку (`git merge main` или `git rebase main`), чтобы избежать больших конфликтов.

## Коммиты

Используем **[Conventional Commits](https://www.conventionalcommits.org/)**: `<type>(<scope>): <описание>`.

- `type`: `feat` (новая функциональность), `fix` (исправление бага), `refactor`, `chore` (конфиги/зависимости/инфра), `docs`, `style` (форматирование, без логики), `test`.
- `scope` — затронутая область: `backend`, `frontend`, `shared`, `prisma`, либо конкретный модуль (`auth`, `categories`, `transactions`).
- Описание — на русском, в повелительном наклонении, без точки на конце (`добавь`, `исправь`, а не `добавил`/`добавлено`).
- Один коммит — одно логическое изменение; не смешивать несвязанные фичи в одном коммите.

## Окружение

- `backend/.env` — `PORT`, `DATABASE_URL` (см. `backend/.env.example`).
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL` (см. `frontend/.env.example`).
- `.env` файлы в git не коммитятся.
