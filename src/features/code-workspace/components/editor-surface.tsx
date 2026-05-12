"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Save } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FileIcon } from "react-material-vscode-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as workspaceApi from "@/features/workspace/apis/workspace-client";
import { workspaceKeys } from "@/features/workspace/libs/query-keys";

import { langFromPath } from "../libs/lang-map";
import { EditorSkeleton } from "./editor-skeleton";

const ShikiCodeEditor = dynamic(
  () => import("./shiki-editor").then((m) => m.ShikiCodeEditor),
  {
    ssr: false,
    loading: () => <EditorSkeleton className="min-h-0 flex-1" />,
  }
);

type EditorSurfaceProps = {
  tabTitle: string;
  path: string;
  /** `null` until the file query has returned at least once for this path. */
  source: string | null;
  projectId: string | null;
  /** When set, saves also push this file into the thread sandbox. */
  threadId: string | null;
};

export function EditorSurface({ tabTitle, path, source, projectId, threadId }: EditorSurfaceProps) {
  const qc = useQueryClient();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [liveText, setLiveText] = useState("");
  const liveRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (source !== null) {
      setLiveText(source);
      liveRef.current = source;
    }
  }, [path, source]);

  const onDocChange = useCallback((text: string) => {
    setLiveText(text);
    liveRef.current = text;
  }, []);

  const colorMode: "light" | "dark" =
    !mounted ? "dark" : resolvedTheme === "light" ? "light" : "dark";

  const showEditor = source !== null;
  const dirty = showEditor && liveText !== (source ?? "");

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!projectId) throw new Error("No project");
      return workspaceApi.putProjectFile(
        projectId,
        { path, content: liveRef.current },
        threadId,
      );
    },
    onSuccess: (data) => {
      toast.success(
        data.sandboxWritten ? "Saved to project and synced to sandbox" : "Saved to project",
      );
      if (!projectId) return;
      void qc.invalidateQueries({ queryKey: workspaceKeys.projectFileContent(projectId, path) });
      void qc.invalidateQueries({ queryKey: workspaceKeys.projectFiles(projectId) });
      if (threadId) {
        void qc.invalidateQueries({ queryKey: workspaceKeys.threadChanges(projectId, threadId) });
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const runSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && projectId) runSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, projectId, runSave]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-card/40 px-2 text-[11px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5 rounded-t border-x border-t border-border bg-background px-3 py-1.5 font-mono text-[12px] text-foreground">
          <FileIcon fileName={tabTitle} size={14} />
          <span className="truncate">{tabTitle}</span>
        </span>
        <span className="hidden min-w-0 flex-1 truncate font-mono text-[10px] sm:inline">{path}</span>
        {dirty ? (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            Modified
          </Badge>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="ml-auto h-7 gap-1 px-2 text-[11px]"
          disabled={!dirty || !projectId || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? (
            "…"
          ) : (
            <>
              <Save className="size-3.5" />
              Save
            </>
          )}
        </Button>
        <span className="hidden shrink-0 text-[10px] text-muted-foreground lg:inline">
          ⌘S
        </span>
        <span className="hidden shrink-0 text-[10px] text-muted-foreground xl:inline">
          Inline AI: Tab · Esc
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        {showEditor ? (
          <ShikiCodeEditor
            key={path}
            doc={source}
            lang={langFromPath(path)}
            colorMode={colorMode}
            inlineSuggest={projectId ? { projectId, path } : null}
            onDocumentChange={onDocChange}
            className="absolute inset-0 min-h-0"
          />
        ) : (
          <EditorSkeleton className="absolute inset-0 min-h-0" />
        )}
      </div>
    </div>
  );
}
