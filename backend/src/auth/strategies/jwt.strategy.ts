import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueryBus } from "@nestjs/cqrs";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload, User } from "@expense-tracker/shared";
import { GetUserByIdQuery } from "../../users/queries/get-user-by-id.query";

/** Passport-стратегия JWT: извлекает payload и загружает пользователя из БД. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly queryBus: QueryBus,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  /**
   * Валидирует JWT payload и возвращает актуального пользователя.
   *
   * @param payload - Декодированный JWT с `sub` (id) и `email`.
   * @returns Публичные данные пользователя для `request.user`.
   * @throws {UnauthorizedException} Пользователь из токена не найден в БД.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.queryBus.execute<GetUserByIdQuery, User | null>(
      new GetUserByIdQuery(payload.sub),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
