# AGENTS.md — Frontend

Справочник состояния frontend. Правила FSD и shadcn — в `.cursor/rules/frontend-fsd.mdc` и `.cursor/rules/frontend-shadcn.mdc`. Общий контекст монорепо — [корневой AGENTS.md](../AGENTS.md).

## Стек

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4, shadcn/ui (new-york, neutral), Feature-Sliced Design
- Zustand (auth) + TanStack Query (API), формы: react-hook-form + zod
- Порт: 3000

## Структура

```
frontend/src/
├── app/         # App Router + провайдеры + auth-effects
├── views/       # композиция страниц: legal, dashboard, categories, profile
├── widgets/     # app-layout (сайдбар, auth-guard, logout)
├── features/    # auth/*, transactions/*, categories/*
├── entities/    # user, transaction, category
└── shared/      # api-клиент, shadcn ui, lib, config, providers
```

## Реализованные экраны

- **Auth:** `/login`, `/register` (`features/auth/*`). Успех → Zustand `entities/user` + JWT в `shared/api/client` → редирект на `/`. `401` → logout + `/login` (`app/auth-effects.tsx`). Регистрация: чекбокс `agreeToTerms` только на фронте; ссылки на `/terms`, `/privacy` (`views/legal`) без `target="_blank"`. **Риск:** JWT в `localStorage` (XSS); для production рассмотреть httpOnly cookie + refresh.
- **Protected shell:** `app/(app)` — `/`, `/categories`, `/profile` под `widgets/app-layout`.
- **Dashboard `/`:** `features/transactions/list` (пагинация 10, `keepPreviousData`) + join категорий на клиенте; создание — `features/transactions/create` (Dialog), инвалидация `transactionKeys.all`.
- **Categories `/categories`:** list + create; edit/delete — ещё не сделаны.
- **Profile `/profile`:** заглушка; logout — кнопка в карточке и иконка в футере сайдбара.

## Окружение

- `frontend/.env.local` — `NEXT_PUBLIC_API_URL` (см. `frontend/.env.example`).
