"use client";

import { ChevronRight } from "lucide-react";
import { FileIcon } from "react-material-vscode-icons";

import { useTreeExpansion } from "../hooks/use-tree-expansion";
import type { FsNode } from "../libs/mock-files";
import { walkFiles } from "../utils/flatten-tree";

const DEFAULT_OPEN_FOLDERS = ["workspace"];

export function ProjectFileTree({
  tree,
  activePath,
  onOpen,
}: {
  tree: FsNode;
  activePath: string;
  onOpen: (path: string) => void;
}) {
  const { isOpen, toggle } = useTreeExpansion(DEFAULT_OPEN_FOLDERS);
  const rows = walkFiles(tree, isOpen);

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-xs text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-3 py-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
        Explorer
      </div>
      <div className="min-h-0 flex-1 overflow-auto py-1">
        {rows.map((row) => {
          const pad = 4 + row.depth * 12;
          if (row.kind === "folder") {
            return (
              <button
                key={row.key}
                type="button"
                onClick={() => toggle(row.key)}
                className="flex w-full items-center gap-1.5 px-2 py-[3px] text-left text-sidebar-foreground hover:bg-sidebar-accent/60"
                style={{ paddingLeft: pad }}
              >
                <ChevronRight
                  className={
                    row.expanded
                      ? "size-3 shrink-0 rotate-90 text-muted-foreground transition-transform"
                      : "size-3 shrink-0 text-muted-foreground transition-transform"
                  }
                />
                <FileIcon
                  fileName={row.name}
                  isFolder
                  isExpanded={row.expanded}
                  size={16}
                />
                <span className="truncate">{row.name}</span>
              </button>
            );
          }
          const active = row.path === activePath;
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => onOpen(row.path)}
              className={
                active
                  ? "flex w-full items-center gap-1.5 bg-sidebar-accent px-2 py-[3px] text-left text-sidebar-accent-foreground"
                  : "flex w-full items-center gap-1.5 px-2 py-[3px] text-left text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }
              style={{ paddingLeft: pad }}
            >
              <span className="size-3 shrink-0" />
              <FileIcon fileName={row.name} size={16} />
              <span className="truncate">{row.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
