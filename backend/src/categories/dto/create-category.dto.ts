import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CreateCategoryDto as ICreateCategoryDto } from "@expense-tracker/shared";

export class CreateCategoryDto implements ICreateCategoryDto {
  @ApiProperty({ example: "Продукты" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: "🛒" })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: "#22c55e" })
  @IsOptional()
  @IsString()
  color?: string;
}
