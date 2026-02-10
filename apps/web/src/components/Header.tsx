"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/tech-vault", label: "TechVault" },
  { href: "/thought-forge", label: "ThoughtForge" },
  { href: "/mindstream", label: "MindStream" },
  { href: "/finance-hub", label: "FinanceHub" },
  { href: "/learn-hub", label: "LearnHub" },
  { href: "/community", label: "Community" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-14">
          <Link href="/" className="font-semibold text-primary-600">
            Content Platform
          </Link>
          <ul className="flex gap-6">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    pathname === href || (href !== "/" && pathname.startsWith(href))
                      ? "text-primary-600 font-medium"
                      : "text-gray-600 hover:text-primary-600"
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex gap-4">
            <Link
              href="/api/auth/signin"
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
