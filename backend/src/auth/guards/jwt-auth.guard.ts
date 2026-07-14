import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard JWT-аутентификации для защищённых маршрутов.
 *
 * @throws {UnauthorizedException} Отсутствует, просрочен или невалиден Bearer-токен.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
