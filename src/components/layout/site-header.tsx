import Link from "next/link";

import { UserButton } from "@/components/auth/user-button";
import { LogoutButton } from "@/components/auth/logout-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-border border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-sm tracking-tight hover:opacity-90">
            Home
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LogoutButton variant="ghost" />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
