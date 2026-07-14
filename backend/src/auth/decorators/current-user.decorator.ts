import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "@expense-tracker/shared";

/**
 * Декоратор параметра: извлекает аутентифицированного пользователя из `request.user`.
 *
 * @returns Публичные данные пользователя, установленные {@link JwtStrategy}.
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
