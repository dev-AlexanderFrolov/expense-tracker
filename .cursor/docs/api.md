# API

REST API на NestJS. Базовый URL локально: `http://localhost:4000`.

Интерактивная документация (Swagger): **http://localhost:4000/docs** — доступна, пока `NODE_ENV !== production`.

Типы ответов и тел запросов совпадают с `@expense-tracker/shared`. Классы валидации — в `backend/src/<module>/dto`.

## Общие правила

### Аутентификация

Защищённые эндпоинты требуют заголовок:

```http
Authorization: Bearer <accessToken>
```

Без токена или с невалидным JWT → `401`.

### Формат ошибок

Типичный ответ исключения NestJS:

```json
{
  "statusCode": 400,
  "message": "…",
  "error": "Bad Request"
}
```

Семантика:

| Код | Когда |
|-----|--------|
| `400` | Валидация тела / query |
| `401` | Нет/невалидный JWT или неверный логин |
| `404` | Ресурс не найден **или** принадлежит другому пользователю |
| `409` | Unique-конфликт (email, имя категории) или FK (удаление категории с транзакциями) |
| `429` | Превышен rate limit |

### Rate limiting

Глобально: **100 запросов / 60 сек** на IP.

Дополнительно на auth:

| Эндпоинт | Лимит |
|----------|-------|
| `POST /auth/register` | 5 / мин |
| `POST /auth/login` | 10 / мин |

### Даты и числа

- Даты — ISO-8601 строки (`2026-07-13T00:00:00.000Z`).
- `amount` в ответах — `number` (Prisma `Decimal` сериализуется в число).
- `amount` в запросах — положительное число (`@IsPositive`).

---

## Auth

Префикс: `/auth`. JWT не требуется. Throttler на контроллере.

### `POST /auth/register`

Регистрация. Пароль хэшируется bcrypt.

**Body:**

| Поле | Тип | Правила |
|------|-----|---------|
| `email` | string | email |
| `name` | string | непустая строка |
| `password` | string | min 6 |

**Ответ `201`:** `AuthResponse`

```json
{
  "accessToken": "eyJ…",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "createdAt": "2026-07-13T12:00:00.000Z",
    "updatedAt": "2026-07-13T12:00:00.000Z"
  }
}
```

**Ошибки:** `400`, `409` (email занят), `429`.

### `POST /auth/login`

**Body:**

| Поле | Тип | Правила |
|------|-----|---------|
| `email` | string | email |
| `password` | string | min 6 |

**Ответ `201`:** тот же `AuthResponse`.

**Ошибки:** `400`, `401` (неверный email/пароль), `429`.

---

## Categories

Префикс: `/categories`. Все методы — **JWT**. Изоляция по `userId`: чужая категория → `404`.

### `POST /categories`

**Body:**

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `name` | string | да | Уникально в рамках пользователя |
| `icon` | string | нет | Иконка (свободная строка) |
| `color` | string | нет | Цвет (например `#22c55e`) |

**Ответ `201`:** `Category`

```json
{
  "id": "uuid",
  "name": "Продукты",
  "icon": "🛒",
  "color": "#22c55e",
  "userId": "uuid",
  "createdAt": "…",
  "updatedAt": "…"
}
```

**Ошибки:** `400`, `401`, `409` (имя уже есть).

### `GET /categories`

Список категорий текущего пользователя.

**Ответ `200`:** `Category[]`.

### `PATCH /categories/:id`

**Path:** `id` — UUID категории.

**Body (все поля опциональны):** `name?`, `icon?`, `color?`.

**Ответ `200`:** обновлённая `Category`.

**Ошибки:** `400`, `401`, `404`, `409`.

### `DELETE /categories/:id`

**Ответ `200`:** пустое тело.

**Ошибки:** `401`, `404`, `409` (к категории привязаны транзакции — `onDelete: Restrict`).

---

## Transactions

Префикс: `/transactions`. Все методы — **JWT**. Чужая транзакция → `404`.

При create/update `categoryId` должен принадлежать текущему пользователю, иначе `404`.

> Маршрут `GET /transactions/summary` объявлен **до** `GET /transactions/:id`, чтобы `summary` не воспринимался как id.

### `POST /transactions`

**Body:**

| Поле | Тип | Обязательное | Правила |
|------|-----|--------------|---------|
| `amount` | number | да | > 0 |
| `type` | enum | да | `INCOME` \| `EXPENSE` |
| `date` | string | да | ISO date string |
| `categoryId` | string | да | UUID своей категории |
| `description` | string | нет | — |

**Ответ `201`:** `Transaction`

```json
{
  "id": "uuid",
  "amount": 1500,
  "type": "EXPENSE",
  "description": "Продукты в магазине",
  "date": "2026-07-13T00:00:00.000Z",
  "categoryId": "uuid",
  "userId": "uuid",
  "createdAt": "…"
}
```

**Ошибки:** `400`, `401`, `404` (категория).

### `GET /transactions`

Список с фильтрами и пагинацией.

**Query:**

| Параметр | Тип | По умолчанию | Правила |
|----------|-----|--------------|---------|
| `dateFrom` | ISO string | — | опционально |
| `dateTo` | ISO string | — | опционально |
| `type` | `INCOME` \| `EXPENSE` | — | опционально |
| `categoryId` | UUID | — | опционально |
| `page` | int | `1` | ≥ 1 |
| `limit` | int | `10` | 1…100 |

**Ответ `200`:** `PaginatedResult<Transaction>`

```json
{
  "items": [ /* Transaction */ ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### `GET /transactions/summary`

Агрегат доходов/расходов за календарный месяц.

**Query (обязательные):**

| Параметр | Тип | Правила |
|----------|-----|---------|
| `month` | int | 1…12 |
| `year` | int | 1970…2999 |

**Ответ `200`:** `TransactionSummary`

```json
{
  "month": 7,
  "year": 2026,
  "totalIncome": 80000,
  "totalExpense": 45000,
  "balance": 35000,
  "byCategory": [
    {
      "categoryId": "uuid",
      "type": "EXPENSE",
      "total": 4500
    }
  ]
}
```

`balance` = `totalIncome - totalExpense`.

### `GET /transactions/:id`

**Ответ `200`:** `Transaction`.  
**Ошибки:** `401`, `404`.

### `PATCH /transactions/:id`

**Body:** частичный `CreateTransactionDto` (все поля опциональны).

**Ответ `200`:** обновлённая `Transaction`.  
**Ошибки:** `400`, `401`, `404` (транзакция или категория).

### `DELETE /transactions/:id`

**Ответ `200`:** пустое тело.  
**Ошибки:** `401`, `404`.

---

## Users

Отдельного публичного REST-контроллера нет. Модуль `users` используется Auth через CQRS.

---

## Связанные файлы

- Контроллеры: `backend/src/auth`, `categories`, `transactions`
- Shared-типы: `packages/shared/src/types/*`
- Краткий справочник: `backend/AGENTS.md`
- Схема БД: [database.md](./database.md)
