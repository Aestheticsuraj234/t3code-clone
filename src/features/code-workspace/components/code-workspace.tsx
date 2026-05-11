"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { openFilePathMock } from "../actions/open-file";
import { useActiveFile } from "../hooks/use-active-file";
import { DEFAULT_OPEN_FILE, MOCK_FILE_TREE, MOCK_SOURCES } from "../libs/mock-files";
import { EditorSurface } from "./editor-surface";
import { ProjectFileTree } from "./project-file-tree";

export function CodeWorkspace() {
  const { path, setPath, tabTitle } = useActiveFile(DEFAULT_OPEN_FILE);
  const source = MOCK_SOURCES[path] ?? `// ${path}\n// (preview not available for this file)\n`;

  return (
    <ResizablePanelGroup
      id="code-workspace"
      orientation="horizontal"
      className="flex h-full min-h-0 rounded-none"
      defaultLayout={{ explorer: 30, editor: 70 }}
    >
      <ResizablePanel
        id="explorer"
        defaultSize="30%"
        minSize="18%"
        className="min-w-0"
      >
        <ProjectFileTree
          tree={MOCK_FILE_TREE}
          activePath={path}
          onOpen={(p) => setPath(openFilePathMock(p))}
        />
      </ResizablePanel>
      <ResizableHandle className="w-px bg-border" />
      <ResizablePanel id="editor" defaultSize="70%" minSize="40%" className="min-w-0">
        <EditorSurface tabTitle={tabTitle} path={path} source={source} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
