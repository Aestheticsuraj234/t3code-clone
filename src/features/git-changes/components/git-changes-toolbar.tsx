"use client";

import { ChevronDown, GitBranch, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MOCK_BRANCH, MOCK_BRANCH_REMOTE } from "../libs/mock-changes";

export function GitChangesToolbar() {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-background px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs">
          <GitBranch className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{MOCK_BRANCH_REMOTE}</span>
          <span className="text-muted-foreground">{MOCK_BRANCH}</span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="More"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="ml-auto h-7 gap-1 rounded-md bg-muted/40 px-2 text-xs"
      >
        Create Branch &amp; Commit
        <ChevronDown className="size-3.5 opacity-70" />
      </Button>
    </div>
  );
}
