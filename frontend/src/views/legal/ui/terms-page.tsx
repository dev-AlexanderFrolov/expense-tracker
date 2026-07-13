import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function TermsPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Пользовательское соглашение</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>
            Настоящее пользовательское соглашение регулирует условия использования сервиса Expense
            Tracker. Регистрируясь в сервисе, вы подтверждаете, что ознакомились с условиями и
            принимаете их.
          </p>
          <p>
            Сервис предоставляется «как есть». Вы обязуетесь использовать сервис только в законных
            целях и не предпринимать действий, способных нарушить его работу или безопасность.
          </p>
          <p>
            Администрация сервиса оставляет за собой право изменять условия соглашения. Актуальная
            версия всегда доступна на этой странице.
          </p>
          <Link href="/register" className="text-foreground underline underline-offset-4">
            ← Вернуться к регистрации
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
