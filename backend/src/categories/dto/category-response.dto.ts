import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Category } from "@expense-tracker/shared";

/** OpenAPI-схема категории. */
export class CategoryResponseDto implements Category {
  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  id!: string;

  @ApiProperty({ example: "Продукты" })
  name!: string;

  @ApiPropertyOptional({ example: "🛒" })
  icon?: string;

  @ApiPropertyOptional({ example: "#22c55e" })
  color?: string;

  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  userId!: string;

  @ApiProperty({ example: "2026-07-13T12:00:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2026-07-13T12:00:00.000Z" })
  updatedAt!: string;
}
