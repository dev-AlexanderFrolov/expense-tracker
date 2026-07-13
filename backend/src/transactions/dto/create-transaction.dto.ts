import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { CreateTransactionDto as ICreateTransactionDto, TransactionType } from "@expense-tracker/shared";

export class CreateTransactionDto implements ICreateTransactionDto {
  @ApiProperty({ example: 1500 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ example: "Продукты в магазине" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2026-07-13T00:00:00.000Z" })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;
}
