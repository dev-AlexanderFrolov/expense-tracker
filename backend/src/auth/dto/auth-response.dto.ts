import { ApiProperty } from "@nestjs/swagger";
import { AuthResponse } from "@expense-tracker/shared";
import { UserResponseDto } from "../../users/dto/user-response.dto";

/** OpenAPI-схема ответа register/login. */
export class AuthResponseDto implements AuthResponse {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT access-токен",
  })
  accessToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
