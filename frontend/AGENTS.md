# AGENTS.md — Frontend

Контекст frontend-воркспейса для AI-агентов. Общая информация по монорепозиторию — в [корневом AGENTS.md](../AGENTS.md).

## Стек

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Стили:** Tailwind CSS v4, shadcn/ui (new-york, neutral)
- **Архитектура:** [Feature-Sliced Design](#feature-sliced-design)
- **Состояние/данные:** Zustand (клиентский стейт, напр. auth) + TanStack Query (запросы к API)
- **Формы:** react-hook-form + zod
- **Порт:** 3000

## Структура

```
frontend/
└── src/
    ├── app/         # Next.js App Router = FSD-слой app (routing, layout, providers, globals.css)
    ├── views/       # FSD-слой pages (композиция страниц; назван `views`, а не `pages`, чтобы не конфликтовать с Pages Router Next.js). Слайсы: `legal` (статичные `/terms`, `/privacy`), `dashboard`, `categories`, `profile`
    ├── widgets/     # FSD-слой widgets: `app-layout` — защищённая оболочка (`/`, `/categories`, `/profile`) с сайдбар-меню, auth-guard и logout
    ├── features/    # FSD-слой features (пользовательские сценарии, напр. auth/login)
    ├── entities/    # FSD-слой entities (бизнес-сущности, напр. user)
    └── shared/      # FSD-слой shared (api-клиент, ui из shadcn, lib, config, providers)
```

## Реализованные модули

- **Auth UI:** страницы `/login` и `/register`, построены на shadcn/ui (`Form`, `Input`, `Button`, `Card`, `Alert`, `Checkbox`).
  - Формы с валидацией react-hook-form + zod (`features/auth/login`, `features/auth/register`).
  - Успешный логин/регистрация → `AuthResponse` кладётся в Zustand-стор `entities/user` (персист в `localStorage`) и токен подставляется во все запросы `shared/api/client`; редирект на `/` (главный экран). **Риск:** JWT в `localStorage` уязвим к XSS; для production рассмотреть httpOnly cookie + refresh.
  - `401` от API → `logout()` + редирект на `/login` (`app/auth-effects.tsx`). При `logout` очищается и кэш TanStack Query (`queryClient.clear()`).
  - Регистрация требует чекбокс согласия с условиями (`agreeToTerms` в `features/auth/register/model/schema.ts`, только фронтовая валидация, в `CreateUserDto` на backend не передаётся). Ссылки внутри лейбла ведут на статичные страницы `/terms` и `/privacy` (слайс `views/legal`), открываются в той же вкладке (без `target="_blank"`).
- **Главный экран:** route group `app/(app)` (маршруты `/`, `/categories`, `/profile`) под общим защищённым layout `widgets/app-layout` — auth-guard редиректит неавторизованных на `/login`, сайдбар (shadcn `Sidebar`) с меню и профилем/logout.
  - `/` → `views/dashboard` + `features/transactions/list`: таблица транзакций постранично (10/стр) через `useQuery` (`entities/transaction`, `keepPreviousData`), категория подтягивается отдельным запросом (`entities/category`) и джойнится на клиенте по `categoryId`.
  - Создание транзакции — `features/transactions/create`: диалог (shadcn `Dialog` + `Select`) с формой (react-hook-form + zod), `POST /transactions` через `useMutation`, при успехе инвалидирует `transactionKeys.all`. Категория выбирается из существующих (`GET /categories`); при отсутствии категорий сабмит заблокирован.
  - `/categories` → `views/categories` + `features/categories/list` (список) и `features/categories/create` (диалог); редактирование/удаление — отдельная задача.
  - `/profile` — минимальная заглушка (`views/profile`). Выход из аккаунта: текстовая кнопка в карточке профиля (`LogoutButton`) + иконка `LogoutIconButton` (lucide `LogOut`) в футере сайдбара рядом с именем пользователя.

## Feature-Sliced Design

Frontend построен по методологии **[Feature-Sliced Design](https://feature-sliced.design)**. Слои располагаются в `frontend/src/*`, импорты — только «сверху вниз» (`app → views → widgets → features → entities → shared`), горизонтальные импорты между слайсами одного слоя запрещены.

- **`app/`** — совпадает с Next.js App Router (`layout.tsx`, `page.tsx`, `globals.css`, роуты `login/page.tsx`, `register/page.tsx`). Здесь же глобальные провайдеры (`QueryProvider`, `Toaster`) и `auth-effects.tsx` (обработка 401). Роуты — тонкие обёртки, рендерят компонент из `views/*`.
- **`views/`** — FSD-слой `pages` (композиция страницы из виджетов/фич). Назван `views`, а не `pages`, **намеренно** — папка `src/pages` конфликтует с Pages Router Next.js (Next пытается роутить её как старый роутер, страницы App Router перестают резолвиться). Каждый слайс: `views/<name>/ui/*.tsx` + `views/<name>/index.ts` (публичный API).
- **`widgets/`** — самостоятельные композитные блоки UI, которые переиспользуются на разных страницах. Пример: `widgets/app-layout` (сайдбар-меню + auth-guard для защищённых страниц).
- **`features/`** — пользовательские сценарии/фичи. Пример: `features/auth/login`, `features/auth/register`, `features/auth/logout`. Внутри слайса — подпапки `ui/` (компоненты), `model/` (хуки, zod-схемы, состояние фичи), `api/` (запросы к backend).
- **`entities/`** — бизнес-сущности. Пример: `entities/user` — Zustand-стор авторизации (`model/store.ts`) с персистом в `localStorage`.
- **`shared/`** — код без привязки к бизнес-логике: `shared/ui` (компоненты shadcn/ui), `shared/lib` (утилиты, `query-client.ts`), `shared/api` (`apiRequest`/`ApiError`, JWT в памяти + `setOnUnauthorized`), `shared/config`, `shared/providers` (TanStack Query).

### Правила слайсов

- Публичный API слайса — только через `index.ts` в его корне (`export { X } from "./ui/x"`), импортировать напрямую из внутренних файлов слайса снаружи нельзя.
- Каждый слайс/сегмент — папка `ui/`, `model/`, `api/` (только те, что нужны).
- Новые сущности/фичи добавляются как отдельные слайсы, а не расширением существующих файлов.
- **ESLint FSD boundaries** в `frontend/eslint.config.mjs`: запрет deep imports (`@/features/foo/ui/...`), импортов «вверх» по слоям и из `shared` в верхние слои.

### Подводные камни shadcn/ui

- `npx shadcn add <component>` **не обновляет** `globals.css` под уже настроенные `cssVariables: true`. Если в `globals.css` нет полного набора токенов (`--primary`, `--destructive`, `--border`, `--input`, `--muted-foreground` и т.д. + `@theme inline` + `.dark`), то классы типа `bg-primary`/`text-destructive` не генерируются, и вёрстка выглядит «сломанной» (не те цвета/чёрный фон). Актуальный полный набор токенов уже лежит в `frontend/src/app/globals.css` — при добавлении новых компонентов проверяй, что они не приносят токены, которых там нет.
- Компонент `Label` (и, соответственно, `FormLabel`) из коробки имеет базовый класс `flex`. Это ок для лейбла с иконкой, но **ломает перенос текста**, если внутри лейбла обычный параграф с несколькими inline-ссылками (каждая ссылка/текстовый узел становится отдельным flex-item и переносится как своя колонка). Для текста с несколькими инлайновыми ссылками переопределяй display на `inline` через className (например `className="inline ..."` — tailwind-merge корректно перекрывает `flex`).
- `FormLabel` подсвечивает текст красным (`data-[error=true]:text-destructive`), а инпуты/чекбоксы — красной рамкой (`aria-invalid:border-destructive`) автоматически при ошибке валидации поля. Если по дизайну красным должен быть только текст `FormMessage` (как договорились для чекбокса согласия), нужно явно перекрывать через className: `data-[error=true]:text-foreground` на `FormLabel` и `aria-invalid:border-input aria-invalid:ring-0` на контроле.

## Соглашения

- Типы и DTO — только из `@expense-tracker/shared`; не дублируй интерфейсы локально.
- Конфиги TypeScript и ESLint — из `@expense-tracker/tsconfig/*` и `@expense-tracker/eslint-config`; не создавай локальные копии.

## Известные инфраструктурные фиксы

- **`pnpm lint` (frontend) падал** с `Converting circular structure to JSON` — конфиг подключал правила Next через устаревший `FlatCompat.extends("next/core-web-vitals")`, несовместимый с ESLint 9/Next 16. Исправлено: `frontend/eslint.config.mjs` подключает `@next/eslint-plugin-next` напрямую как flat-config плагин.

## Окружение

- `frontend/.env.local` — `NEXT_PUBLIC_API_URL` (см. `frontend/.env.example`).
