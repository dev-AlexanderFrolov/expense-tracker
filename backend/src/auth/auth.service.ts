import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthResponse, CreateUserDto, JwtPayload, LoginDto, User } from "@expense-tracker/shared";
import { CreateUserCommand } from "../users/commands/create-user.command";
import { GetUserByEmailQuery } from "../users/queries/get-user-by-email.query";
import { UserWithPassword } from "../users/users.service";

const SALT_ROUNDS = 10;
const DUMMY_PASSWORD_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

/** Сервис аутентификации: регистрация, вход и выпуск JWT. */
@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Создаёт пользователя и формирует ответ с access-токеном.
   *
   * @param dto - Email, имя и пароль нового пользователя.
   * @returns Access-токен и публичные данные пользователя.
   * @throws {ConflictException} Пользователь с таким email уже существует.
   */
  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(dto.email, dto.name, passwordHash),
    );

    return this.buildAuthResponse(user);
  }

  /**
   * Проверяет учётные данные и формирует ответ с access-токеном.
   *
   * @param dto - Email и пароль пользователя.
   * @returns Access-токен и публичные данные пользователя.
   * @throws {UnauthorizedException} Неверный email или пароль.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.buildAuthResponse(user);
  }

  /**
   * Проверяет email и пароль пользователя.
   *
   * @param email - Email пользователя (регистр не важен).
   * @param password - Пароль в открытом виде.
   * @returns Публичные данные пользователя без пароля.
   * @throws {UnauthorizedException} Пользователь не найден или пароль неверный.
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.queryBus.execute<GetUserByEmailQuery, UserWithPassword | null>(
      new GetUserByEmailQuery(email.toLowerCase()),
    );

    const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Формирует ответ аутентификации с подписанным JWT.
   *
   * @param user - Публичные данные пользователя.
   * @returns Access-токен и данные пользователя.
   */
  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const accessToken = await this.signToken(user);
    return { accessToken, user };
  }

  /**
   * Подписывает JWT с идентификатором и email пользователя.
   *
   * @param user - Публичные данные пользователя.
   * @returns Подписанный access-токен.
   */
  private signToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }
}
