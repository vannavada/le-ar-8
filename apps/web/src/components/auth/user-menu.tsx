"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 rounded-full p-1 hover:bg-muted transition-colors"
      >
        {user.image ? (
          <img src={user.image} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium">
          {user.name ?? user.email}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
            {user.email}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
