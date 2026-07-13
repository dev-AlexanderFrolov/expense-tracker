import Link from "next/link";
import { RegisterForm } from "@/features/auth/register";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт Expense Tracker</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
