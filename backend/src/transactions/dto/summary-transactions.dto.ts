import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { SummaryTransactionsDto as ISummaryTransactionsDto } from "@expense-tracker/shared";

export class SummaryTransactionsDto implements ISummaryTransactionsDto {
  @ApiProperty({ example: 7, minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(2999)
  year!: number;
}
