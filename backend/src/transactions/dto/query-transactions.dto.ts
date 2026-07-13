import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { QueryTransactionsDto as IQueryTransactionsDto, TransactionType } from "@expense-tracker/shared";

export class QueryTransactionsDto implements IQueryTransactionsDto {
  @ApiPropertyOptional({ example: "2026-07-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: "2026-07-31T23:59:59.999Z" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
