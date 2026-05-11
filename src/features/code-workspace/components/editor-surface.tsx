"use client";

import { FileIcon } from "react-material-vscode-icons";

import { langFromPath } from "../libs/lang-map";
import { ShikiCodeEditor } from "./shiki-editor";

export function EditorSurface({
  tabTitle,
  path,
  source,
}: {
  tabTitle: string;
  path: string;
  source: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex h-10 items-center border-b border-border bg-card/40 px-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5 rounded-t border-x border-t border-border bg-background px-3 py-1.5 font-mono text-[12px] text-foreground">
          <FileIcon fileName={tabTitle} size={14} />
          {tabTitle}
        </span>
        <span className="ml-2 truncate font-mono text-[10px]">{path}</span>
      </div>
      <ShikiCodeEditor doc={source} lang={langFromPath(path)} className="min-h-0 flex-1" />
    </div>
  );
}
