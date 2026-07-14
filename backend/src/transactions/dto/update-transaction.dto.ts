import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";
import { UpdateTransactionDto as IUpdateTransactionDto, TransactionType } from "@expense-tracker/shared";

export class UpdateTransactionDto implements IUpdateTransactionDto {
  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: "Продукты в магазине" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "2026-07-13T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
