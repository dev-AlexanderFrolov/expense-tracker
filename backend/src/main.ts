import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./prisma/prisma-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin.split(",").map((origin) => origin.trim()),
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Expense Tracker API")
      .setDescription("REST API трекера расходов")
      .setVersion("0.1.0")
      .addBearerAuth()
      .addTag("auth", "Регистрация и авторизация")
      .addTag("categories", "Категории расходов и доходов")
      .addTag("transactions", "Транзакции: CRUD, фильтры и сводка")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}

bootstrap();
