import type { Metadata } from "next";
import { QueryProvider } from "@/shared/providers/query-provider";
import { Toaster } from "@/shared/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Трекер расходов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
