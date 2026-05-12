"use client";

import { ChevronDown, FileCode2 } from "lucide-react";

import type { PendingChangeRow } from "@/features/workspace/libs/workspace-service";
import { basename, dirname } from "../utils/diff-stats";

type Props = {
  changes: PendingChangeRow[];
  totals: { added: number; removed: number; files: number };
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function ChangedFilesList({ changes, totals, activeId, onSelect }: Props) {
  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground">
        <ChevronDown className="size-3.5" />
        <span className="font-medium text-foreground">
          {totals.files} Pending {totals.files === 1 ? "change" : "changes"}
        </span>
        <span className="ml-1 text-emerald-400">+{totals.added}</span>
        <span className="text-red-400">-{totals.removed}</span>
      </div>
      <ul className="px-1 pb-1">
        {changes.length === 0 ? (
          <li className="px-2 py-2 text-xs text-muted-foreground">No pending edits for this thread.</li>
        ) : null}
        {changes.map((file) => {
          const active = file.id === activeId;
          const name = basename(file.path);
          const dir = dirname(file.path);
          return (
            <li key={file.id}>
              <button
                type="button"
                onClick={() => onSelect(file.id)}
                className={
                  active
                    ? "flex w-full items-center gap-2 rounded-md bg-accent px-2 py-1 text-left text-xs"
                    : "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-accent/60"
                }
              >
                <FileCode2 className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{name}</span>
                {dir ? <span className="truncate text-muted-foreground">{dir}</span> : null}
                <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-emerald-400">+{file.added}</span>
                  <span className="text-red-400">-{file.removed}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
