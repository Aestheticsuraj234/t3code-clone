"use client";

import type { ChangedFile } from "../libs/mock-changes";
import { formatDiffStat } from "../utils/diff-stats";

export function ChangesDiffView({ file }: { file: ChangedFile | undefined }) {
  if (!file) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-xs text-muted-foreground">
        Select a file to view its diff.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-3 py-1.5 text-[11px]">
        <span className="truncate font-mono text-foreground">{file.path}</span>
        <span className="font-mono text-muted-foreground">{formatDiffStat(file.added, file.removed)}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {file.diff.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">No preview for this file.</div>
        ) : (
          <pre className="font-mono text-[11px] leading-5">
            {file.diff.map((line, i) => {
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
