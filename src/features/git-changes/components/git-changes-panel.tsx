"use client";

import { useActiveChange } from "../hooks/use-active-change";
import { ChangedFilesList } from "./changed-files-list";
import { ChangesDiffView } from "./changes-diff-view";
import { GitChangesToolbar } from "./git-changes-toolbar";

export function GitChangesPanel() {
  const { changes, activePath, setActivePath, activeFile } = useActiveChange();

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <GitChangesToolbar />
      <ChangedFilesList changes={changes} activePath={activePath} onSelect={setActivePath} />
      <ChangesDiffView file={activeFile} />
    </div>
  );
}
