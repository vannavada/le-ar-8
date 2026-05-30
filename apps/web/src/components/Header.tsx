"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SECTIONS } from "@/lib/sections";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          lear8
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {SECTIONS.map((section) => (
            <Link
              key={section.slug}
              href={section.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname.startsWith(section.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {section.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
