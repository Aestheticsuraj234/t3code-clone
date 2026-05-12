"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function EditorSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 p-4",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading editor"
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        <span>Loading highlighter…</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-md border border-border/60 bg-muted/15 p-3">
        <div className="h-3 w-3/5 max-w-[18rem] animate-pulse rounded bg-muted/50" />
        <div className="h-3 w-4/5 max-w-[22rem] animate-pulse rounded bg-muted/40" />
        <div className="h-3 w-2/5 max-w-[14rem] animate-pulse rounded bg-muted/35" />
        <div className="h-3 w-3/4 max-w-[20rem] animate-pulse rounded bg-muted/40" />
        <div className="h-3 w-1/2 max-w-[16rem] animate-pulse rounded bg-muted/35" />
      </div>
    </div>
  );
}
