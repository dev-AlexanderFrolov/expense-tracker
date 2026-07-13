import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { UpdateCategoryDto as IUpdateCategoryDto } from "@expense-tracker/shared";

export class UpdateCategoryDto implements IUpdateCategoryDto {
  @ApiPropertyOptional({ example: "Продукты" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "🛒" })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: "#22c55e" })
  @IsOptional()
  @IsString()
  color?: string;
}
