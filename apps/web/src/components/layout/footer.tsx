import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <span className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} le-ar-8
        </span>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          {SECTIONS.map((s) => (
            <Link
              key={s.slug}
              href={s.href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
