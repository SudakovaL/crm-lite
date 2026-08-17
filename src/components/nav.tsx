"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/accounts", label: "Accounts" },
  { href: "/contacts", label: "Contacts" },
  { href: "/opportunities", label: "Opportunities" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 h-14">
        <Link href="/dashboard" className="font-semibold tracking-tight shrink-0">
          CRM-lite <span className="text-muted font-normal">· стенды</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-foreground hover:bg-background"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
