"use client";

import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PendingChangeRow } from "@/features/workspace/libs/workspace-service";
import { formatDiffStat } from "../utils/diff-stats";

type Props = {
  change: PendingChangeRow | undefined;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  actionPending?: boolean;
};

export function ChangesDiffView({ change, onAccept, onReject, actionPending }: Props) {
  if (!change) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-xs text-muted-foreground">
        Select a file to view its diff.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/40 px-3 py-1.5 text-[11px]">
        <span className="min-w-0 flex-1 truncate font-mono text-foreground">{change.path}</span>
        <span className="font-mono text-muted-foreground">{formatDiffStat(change.added, change.removed)}</span>
        {onAccept && onReject ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="default"
              className="h-7 gap-1 px-2 text-[11px]"
              disabled={actionPending}
              onClick={() => onAccept(change.id)}
            >
              <Check className="size-3.5" />
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-[11px]"
              disabled={actionPending}
              onClick={() => onReject(change.id)}
            >
              <X className="size-3.5" />
              Reject
            </Button>
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {change.diff.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">No line-by-line preview for this file.</div>
        ) : (
          <pre className="font-mono text-[11px] leading-5">
            {change.diff.map((line, i) => {
              const cls =
                line.kind === "add"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : line.kind === "del"
                    ? "bg-red-500/10 text-red-300"
                    : "text-muted-foreground";
              const prefix = line.kind === "add" ? "+" : line.kind === "del" ? "-" : " ";
              return (
                <div key={i} className={`flex ${cls}`}>
                  <span className="w-5 shrink-0 select-none border-r border-border/60 pr-1 text-right text-muted-foreground/70">
                    {prefix}
                  </span>
                  <span className="whitespace-pre px-2">{line.text || " "}</span>
                </div>
              );
            })}
          </pre>
        )}
      </div>
    </div>
  );
}
