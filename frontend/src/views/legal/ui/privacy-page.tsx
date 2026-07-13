import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function PrivacyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Политика обработки данных</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>
            Мы собираем минимально необходимые персональные данные (имя и email), чтобы вы могли
            зарегистрироваться и пользоваться сервисом Expense Tracker.
          </p>
          <p>
            Пароль хранится в виде хеша и никогда не передаётся и не хранится в открытом виде. Данные
            о расходах и категориях доступны только вам и не передаются третьим лицам.
          </p>
          <p>
            Вы можете запросить удаление своей учётной записи и всех связанных с ней данных в любой
            момент.
          </p>
          <Link href="/register" className="text-foreground underline underline-offset-4">
            ← Вернуться к регистрации
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
