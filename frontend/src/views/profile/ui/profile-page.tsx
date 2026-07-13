"use client";

import { useAuthStore } from "@/entities/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Профиль</h1>
        <p className="text-sm text-muted-foreground">Информация о вашей учётной записи</p>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Дата регистрации</span>
            <span>{dateFormatter.format(new Date(user.createdAt))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
