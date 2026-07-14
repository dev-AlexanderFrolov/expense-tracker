import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthResponse } from "@expense-tracker/shared";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";

@ApiTags("auth")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Регистрация нового пользователя" })
  register(@Body() dto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: "Авторизация пользователя" })
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }
}
