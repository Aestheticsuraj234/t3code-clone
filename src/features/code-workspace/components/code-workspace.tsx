"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import * as workspaceApi from "@/features/workspace/apis/workspace-client";
import { workspaceKeys } from "@/features/workspace/libs/query-keys";

import { openFilePathMock } from "../actions/open-file";
import { useActiveFile } from "../hooks/use-active-file";
import { EditorSurface } from "./editor-surface";
import { ProjectFileTree } from "./project-file-tree";
import { pathsToFsTree } from "../utils/paths-to-tree";

export function CodeWorkspace({
  projectId,
  threadId,
}: {
  projectId: string | null;
  /** Used to push editor saves into the thread sandbox when available. */
  threadId: string | null;
}) {
  const filesQuery = useQuery({
    queryKey: projectId ? workspaceKeys.projectFiles(projectId) : ["workspace", "project-files", "none"],
    queryFn: () => workspaceApi.getProjectFiles(projectId!),
    enabled: !!projectId,
  });

  const paths = useMemo(() => (filesQuery.data ?? []).map((f) => f.path), [filesQuery.data]);
  const tree = useMemo(() => pathsToFsTree(paths), [paths]);

  const { path, setPath, tabTitle } = useActiveFile(paths[0] ?? "");

  useEffect(() => {
    if (paths.length === 0) return;
    if (!paths.includes(path)) {
      setPath(paths[0]!);
    }
  }, [paths, path, setPath]);

  const contentQuery = useQuery({
    queryKey:
      projectId && path
        ? workspaceKeys.projectFileContent(projectId, path)
        : ["workspace", "project-file", "none", path],
    queryFn: () => workspaceApi.getProjectFile(projectId!, path),
    enabled: !!projectId && !!path,
  });

  /** Don’t pass “// Loading…” into CodeMirror — mount the editor only when we have real server data. */
  const editorSource: string | null =
    projectId && path
      ? contentQuery.data !== undefined
        ? (contentQuery.data?.content ?? "")
        : null
      : null;

  if (!projectId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-muted-foreground">
        Open a project to browse files.
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      id="code-workspace"
      orientation="horizontal"
      className="flex h-full min-h-0 rounded-none"
      defaultLayout={{ explorer: 30, editor: 70 }}
    >
      <ResizablePanel id="explorer" defaultSize="30%" minSize="18%" className="min-w-0">
        <ProjectFileTree
          tree={tree}
          activePath={path}
          onOpen={(p) => setPath(openFilePathMock(p))}
        />
      </ResizablePanel>
      <ResizableHandle className="w-px bg-border" />
      <ResizablePanel id="editor" defaultSize="70%" minSize="40%" className="min-w-0">
        <EditorSurface
          tabTitle={tabTitle}
          path={path}
          source={editorSource}
          projectId={projectId}
          threadId={threadId}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
