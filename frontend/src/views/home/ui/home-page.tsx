"use client";

import Link from "next/link";
import { useAuthStore } from "@/entities/user";
import { LogoutButton } from "@/features/auth/logout";
import { Button } from "@/shared/ui/button";

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">Expense Tracker</h1>

      {isAuthenticated && user ? (
        <>
          <p className="text-sm text-muted-foreground">
            Вы вошли как <span className="font-medium text-foreground">{user.name}</span> ({user.email})
          </p>
          <LogoutButton />
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Заготовка проекта готова к разработке.</p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Зарегистрироваться</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
