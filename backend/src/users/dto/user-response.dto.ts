import { ApiProperty } from "@nestjs/swagger";
import { User } from "@expense-tracker/shared";

/** OpenAPI-схема публичного пользователя. */
export class UserResponseDto implements User {
  @ApiProperty({ example: "c1a2b3d4-e5f6-7890-abcd-ef1234567890" })
  id!: string;

  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ example: "Иван Иванов" })
  name!: string;

  @ApiProperty({ example: "2026-07-13T12:00:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2026-07-13T12:00:00.000Z" })
  updatedAt!: string;
}
