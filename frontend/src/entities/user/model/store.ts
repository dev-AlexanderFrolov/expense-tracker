import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthResponse, User } from "@expense-tracker/shared";
import { setAuthToken } from "@/shared/api/client";
import { queryClient } from "@/shared/lib/query-client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: ({ user, accessToken }) => {
        setAuthToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        setAuthToken(null);
        queryClient.clear();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user, accessToken, isAuthenticated }) => ({
        user,
        accessToken,
        isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.accessToken ?? null);
        state?.setHasHydrated(true);
      },
    },
  ),
);
