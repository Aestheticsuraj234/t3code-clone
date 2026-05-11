"use client";

import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

import { performSignOut } from "./sign-out-shared";

function initials(name: string | undefined | null, email: string | undefined | null) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2)
      return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() ?? "?";
  }
  if (email?.trim()) return email.trim().slice(0, 2).toUpperCase();
  return "?";
}

export function UserButton() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
        disabled
        aria-label="Loading account"
      >
        <Spinner className="size-4" />
      </button>
    );
  }

  const user = session?.user;
  if (!user) return null;

  const label = initials(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 gap-2 rounded-full px-1.5 font-normal hover:bg-accent",
        )}
        aria-label="Account menu"
      >
        <Avatar size="sm">
          {user.image ? (
            <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />
          ) : null}
          <AvatarFallback className="font-medium text-xs">{label}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[140px] truncate text-sm sm:inline">{user.name ?? user.email}</span>
        <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="truncate font-medium">{user.name ?? "Account"}</span>
              <span className="truncate font-normal text-muted-foreground text-xs">{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/")}>Home</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => performSignOut(router)}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
