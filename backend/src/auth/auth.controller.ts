import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthResponse } from "@expense-tracker/shared";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { HttpExceptionResponseDto } from "../common/swagger/http-exception.response";

/** REST-контроллер аутентификации: регистрация и вход. */
@ApiTags("auth")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрирует нового пользователя и возвращает JWT-токен.
   *
   * @param dto - Email, имя и пароль нового пользователя.
   * @returns Access-токен и публичные данные пользователя.
   * @throws {BadRequestException} Невалидные данные запроса.
   * @throws {ConflictException} Пользователь с таким email уже существует.
   * @throws {TooManyRequestsException} Превышен лимит запросов (5 в минуту).
   */
  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Регистрация нового пользователя" })
  @ApiCreatedResponse({
    description: "Пользователь зарегистрирован, выдан access-токен",
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Невалидные данные запроса",
    type: HttpExceptionResponseDto,
  })
  @ApiConflictResponse({
    description: "Пользователь с таким email уже существует",
    type: HttpExceptionResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: "Превышен лимит запросов (5 в минуту)",
    type: HttpExceptionResponseDto,
  })
  register(@Body() dto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  /**
   * Авторизует пользователя по email и паролю.
   *
   * @param dto - Email и пароль пользователя.
   * @returns Access-токен и публичные данные пользователя.
   * @throws {BadRequestException} Невалидные данные запроса.
   * @throws {UnauthorizedException} Неверный email или пароль.
   * @throws {TooManyRequestsException} Превышен лимит запросов (10 в минуту).
   */
  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: "Авторизация пользователя" })
  @ApiCreatedResponse({
    description: "Успешный вход, выдан access-токен",
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Невалидные данные запроса",
    type: HttpExceptionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Неверный email или пароль",
    type: HttpExceptionResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: "Превышен лимит запросов (10 в минуту)",
    type: HttpExceptionResponseDto,
  })
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }
}
