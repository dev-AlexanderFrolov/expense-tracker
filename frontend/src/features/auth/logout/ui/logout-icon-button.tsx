"use client";

import { LogOut } from "lucide-react";
import { useAuthStore } from "@/entities/user";
import { Button } from "@/shared/ui/button";

export function LogoutIconButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={logout}
      title="Выйти"
      aria-label="Выйти"
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut />
    </Button>
  );
}
