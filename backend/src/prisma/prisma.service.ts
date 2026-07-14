import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/** Глобальный Prisma-клиент с управлением подключением к PostgreSQL. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Подключается к БД при инициализации модуля.
   *
   * @throws {Error} Ошибка подключения к PostgreSQL.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Отключается от БД при остановке приложения.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
