# Новая функциональность - Создать модуль транзакций

## Контекст (что уже есть)

- NestJS + Next.js + PostgreSQL + Prisma
- Авторизация (JWT), модуль категорий

## Задача

Создай TransactionsModule - центральный модуль приложения для учета доходов и расходов.

## Модель данных

Добавь модель Transaction в схема призма:

- id (String, uuid, @default(uuid()))
- amount (Decimal)
- type (Enum: INCOME, EXPENSE)
- description (String, nullable)
- date (DateTime)
- categoryId (String, связь с Category)
- userId (String, связь с User)
- createdAt (DateTime, @default(now()))

Обнови модели User и Category - добавь
обратные связи с transactions Transaction[].

После изменения схемы создай и примени миграцию:
npx prisma migrate dev --name add-transactions

## Контроллер и эндпоинты

Эндпоинты:

- POST /transactions : создать транзакцию
- GET /transactions : список с query параметрами
  dateFrom, dateTo, type, categoryId
- GET transactions/summary : агрегация,
  query параметры month и year (оба обязательные)
- GET transactions/:id : одна транзакция
- PATCH transactions/:id : обновить
- DELETE transactions/:id : удалить

## Паттерн

- Следуй структуре модуля из @backend/src/categories/
- Взаимодействие через CQRS

## Ограничения

- Не добавлять зависимости без указания
- используй class-validator для DTO
- После реализации запустить сборку
