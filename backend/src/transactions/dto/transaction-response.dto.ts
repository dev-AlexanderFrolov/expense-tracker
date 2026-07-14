import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  PaginatedResult,
  Transaction,
  TransactionCategorySummary,
  TransactionSummary,
  TransactionType,
} from "@expense-tracker/shared";

/** OpenAPI-схема транзакции. */
export class TransactionResponseDto implements Transaction {
  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  id!: string;

  @ApiProperty({ example: 1500 })
  amount!: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  type!: TransactionType;

  @ApiPropertyOptional({ example: "Продукты в магазине" })
  description?: string;

  @ApiProperty({ example: "2026-07-13T00:00:00.000Z" })
  date!: string;

  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  categoryId!: string;

  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  userId!: string;

  @ApiProperty({ example: "2026-07-13T12:00:00.000Z" })
  createdAt!: string;
}

/** OpenAPI-схема агрегата по категории в сводке. */
export class TransactionCategorySummaryResponseDto implements TransactionCategorySummary {
  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  categoryId!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  type!: TransactionType;

  @ApiProperty({ example: 4500 })
  total!: number;
}

/** OpenAPI-схема месячной сводки транзакций. */
export class TransactionSummaryResponseDto implements TransactionSummary {
  @ApiProperty({ example: 7, minimum: 1, maximum: 12 })
  month!: number;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 80000 })
  totalIncome!: number;

  @ApiProperty({ example: 45000 })
  totalExpense!: number;

  @ApiProperty({ example: 35000 })
  balance!: number;

  @ApiProperty({ type: [TransactionCategorySummaryResponseDto] })
  byCategory!: TransactionCategorySummaryResponseDto[];
}

/** OpenAPI-схема пагинированного списка транзакций. */
export class PaginatedTransactionsResponseDto implements PaginatedResult<TransactionResponseDto> {
  @ApiProperty({ type: [TransactionResponseDto] })
  items!: TransactionResponseDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}
