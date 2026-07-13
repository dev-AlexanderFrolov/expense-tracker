"use client";

import { useAuthStore } from "@/entities/user";
import { Button } from "@/shared/ui/button";

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Button variant="outline" onClick={logout}>
      Выйти
    </Button>
  );
}
