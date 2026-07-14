"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setOnUnauthorized } from "@/shared/api/client";
import { useAuthStore } from "@/entities/user";

export function AuthEffects() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      router.replace("/login");
    });
  }, [logout, router]);

  return null;
}
