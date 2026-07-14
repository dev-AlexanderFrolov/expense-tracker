import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  InternalServerErrorException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

/** Глобальный фильтр Prisma-ошибок: маппит коды P2002/P2003 в HTTP 409. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  /**
   * Обрабатывает известные ошибки Prisma и формирует HTTP-ответ.
   *
   * @param exception - Prisma-ошибка с кодом запроса.
   * @param host - Контекст выполнения NestJS.
   * @returns Ответ 409 для P2002/P2003 или 500 для прочих кодов.
   */
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (code: number) => { json: (body: unknown) => void } }>();

    if (exception.code === "P2002") {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: "Запись с такими данными уже существует",
      });
      return;
    }

    if (exception.code === "P2003") {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: "Связанные данные не позволяют выполнить операцию",
      });
      return;
    }

    const internalError = new InternalServerErrorException();
    response.status(internalError.getStatus()).json(internalError.getResponse());
  }
}
