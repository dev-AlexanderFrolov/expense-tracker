# Схема базы данных

Единственная Prisma-схема: `backend/prisma/schema.prisma`.  
Провайдер: **PostgreSQL**. URL — из `DATABASE_URL` (`backend/.env`).

Локально БД обычно поднимается через `docker-compose.yml`:

- user / password: `postgres` / `postgres`
- database: `expense_tracker`
- port: `5432`

После изменений схемы:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

## Диаграмма связей

```
┌──────────────┐       1:N        ┌──────────────┐       1:N        ┌──────────────────┐
│    users     │ ───────────────► │  categories  │ ───────────────► │   transactions   │
│              │                  │              │                  │                  │
│              │ ─────────────────┴──────────────┴─────────────────►│                  │
└──────────────┘                     1:N                            └──────────────────┘
```

- Удаление **User** → каскадом удаляются его `categories` и `transactions` (`onDelete: Cascade`).
- Удаление **Category** при наличии транзакций — **запрещено** (`onDelete: Restrict`) → API отдаёт `409`.
- Таблицы в snake_case через `@@map`; модели в Prisma — PascalCase.

## Enum

### `TransactionType`

| Значение | Смысл |
|----------|--------|
| `INCOME` | Доход |
| `EXPENSE` | Расход |

Хранится на уровне PostgreSQL enum, в shared — `TransactionType` в TypeScript.

---

## Таблица `users` (модель `User`)

Аккаунт. Является владельцем категорий и транзакций. Изоляция данных — по `id` пользователя из JWT (`sub`).

| Поле (Prisma) | Колонка / тип | Цель |
|---------------|---------------|------|
| `id` | UUID, PK, `@default(uuid())` | Идентификатор пользователя; попадаёт в JWT как `sub` |
| `email` | `String`, `@unique` | Логин; уникален глобально → дубликат при register даёт `409` |
| `name` | `String` | Отображаемое имя в UI и в `AuthResponse.user` |
| `password` | `String` | bcrypt-хэш; **никогда** не отдаётся в API |
| `role` | `String`, default `"USER"` | Зарезервировано под роли; сейчас не участвует в авторизации роутов |
| `createdAt` | `DateTime`, `@default(now())` | Когда создан аккаунт |
| `updatedAt` | `DateTime`, `@updatedAt` | Последнее обновление записи |

Связи:

- `categories Category[]`
- `transactions Transaction[]`

---

## Таблица `categories` (модель `Category`)

Категория расходов/доходов **конкретного пользователя**. Одна и та же метка («Продукты») у разных пользователей — разные строки.

| Поле (Prisma) | Колонка / тип | Цель |
|---------------|---------------|------|
| `id` | UUID, PK | Ссылка из `transactions.categoryId` |
| `name` | `String` | Название категории в UI и отчётах |
| `icon` | `String?` | Опциональная иконка (строка, напр. эмодзи) |
| `color` | `String?` | Опциональный цвет для UI (напр. `#22c55e`) |
| `userId` | `String`, FK → `users.id` | Владелец; все выборки фильтруются по нему |
| `createdAt` | `DateTime` | Создание |
| `updatedAt` | `DateTime` | Обновление |

Ограничения:

- `@@unique([userId, name])` — имя уникально **внутри** пользователя → API `409` при конфликте.
- `user` … `onDelete: Cascade` — вместе с пользователем.
- Транзакции ссылаются с `onDelete: Restrict` — нельзя удалить категорию, пока на неё есть транзакции.

---

## Таблица `transactions` (модель `Transaction`)

Финансовая операция (доход или расход) пользователя.

| Поле (Prisma) | Колонка / тип | Цель |
|---------------|---------------|------|
| `id` | UUID, PK | Идентификатор операции |
| `amount` | `Decimal(12, 2)` | Сумма (> 0 на уровне API). В ответах API — `number` |
| `type` | `TransactionType` | `INCOME` или `EXPENSE`; влияет на summary и фильтры |
| `description` | `String?` | Комментарий / заметка |
| `date` | `DateTime` | Дата операции (фильтры `dateFrom`/`dateTo`, сводка за месяц) |
| `categoryId` | `String`, FK → `categories.id` | Категория; должна принадлежать тому же `userId` |
| `userId` | `String`, FK → `users.id` | Владелец; дублирует связь через category для быстрых фильтров |
| `createdAt` | `DateTime` | Когда запись создана в системе (не путать с `date`) |

Индексы и FK:

- `@@index([userId, date])` — списки и фильтры по периоду.
- `user` … `onDelete: Cascade`.
- `category` … `onDelete: Restrict`.

Разница `date` vs `createdAt`:

- `date` — бизнес-дата операции (когда произошёл платёж).
- `createdAt` — техническое время вставки в БД.

---

## Изоляция данных

Все запросы categories/transactions всегда ограничены `userId` из JWT.

| Ситуация | HTTP |
|----------|------|
| Свой ресурс | обычный ответ |
| Чужой id / несуществующий | `404` (не раскрываем существование) |
| Unique-конфликт | `409` |
| FK Restrict (удаление категории) | `409` (через Prisma P2003 / сервис) |

---

## Миграции

- Файлы миграций: `backend/prisma/migrations/`.
- Dev: `pnpm prisma:migrate` (= `prisma migrate dev` в workspace `backend`).
- Генерация клиента: `pnpm prisma:generate`.

Модель `Expense` **удалена** — в схему не возвращать.

См. также: [api.md](./api.md), [architecture.md](./architecture.md), правило `.cursor/rules/backend-prisma.mdc`.
