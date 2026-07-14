import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/** Стандартное тело HTTP-ошибки NestJS для OpenAPI. */
export class HttpExceptionResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
    example: "Bad Request",
  })
  message!: string | string[];

  @ApiPropertyOptional({ example: "Bad Request" })
  error?: string;
}
