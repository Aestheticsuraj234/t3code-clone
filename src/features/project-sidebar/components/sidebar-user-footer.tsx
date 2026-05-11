"use client";

import { Settings } from "lucide-react";

import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";

export function SidebarUserFooter() {
  return (
    <div className="flex items-center gap-1 border-t border-sidebar-border px-2 py-2">
      <div className="min-w-0 flex-1">
        <UserButton />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        aria-label="Settings"
      >
        <Settings className="size-4" />
      </Button>
    </div>
  );
}
