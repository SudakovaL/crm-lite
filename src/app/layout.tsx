import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "CRM-lite — Выставочные стенды",
  description: "Локальная CRM-lite для агентства выставочных стендов и бренд-зон",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
