"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SECTIONS } from "@/lib/sections";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

/**
 * [/8] terminal mark — inlined from public/brand/terminal-mark-only.svg.
 * Charcoal elements ([, 8, ]) use currentColor → adapt via text-foreground.
 * Teal slash (#00D9CC) is hardcoded as the permanent brand accent.
 */
function TerminalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="100 55 455 140"
      className={cn("h-[1.1em] w-auto flex-shrink-0 select-none", className)}
      aria-label="[/8] mark"
      role="img"
    >
      <g
        fontFamily="'Space Mono','Roboto Mono',ui-monospace,monospace"
        fontWeight="700"
        fontSize="150"
        letterSpacing="2"
      >
        <text x="150" y="170" textAnchor="middle" fill="currentColor">[</text>
        <text x="285" y="170" textAnchor="middle" fill="#00D9CC">/</text>
        <text x="400" y="170" textAnchor="middle" fill="currentColor">8</text>
        <text x="510" y="170" textAnchor="middle" fill="currentColor">]</text>
      </g>
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Brand: [/8] mark + le-ar-8 wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <TerminalMark className="text-foreground" />
          <span className="text-base font-bold tracking-tight text-foreground">
            le-ar-8
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {SECTIONS.filter((s) =>
            ["tech-vault", "thought-forge", "finance-hub", "learn-hub"].includes(s.slug)
          ).map((section) => (
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
          <Link
            href="/now"
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === "/now" || pathname.startsWith("/now/")
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Now
          </Link>
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
