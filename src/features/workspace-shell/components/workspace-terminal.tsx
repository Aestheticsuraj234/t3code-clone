"use client";

import { Loader2, Play, Terminal as TerminalIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import * as workspaceApi from "@/features/workspace/apis/workspace-client";

/** Matches default `E2B_WORKSPACE_ROOT` server-side (synced project files land here). */
const DEFAULT_SANDBOX_CWD = "/home/user/workspace";

type Props = {
  projectId: string | null;
  threadId: string | null;
};

export function WorkspaceTerminal({ projectId, threadId }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [cmd, setCmd] = useState("");
  const [cwd, setCwd] = useState(DEFAULT_SANDBOX_CWD);
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const append = useCallback((text: string) => {
    setLines((prev) => [...prev.slice(-400), text]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const startSandbox = useCallback(async () => {
    if (!projectId || !threadId) return;
    setStarting(true);
    try {
      const r = await workspaceApi.postThreadSandbox(projectId, threadId);
      toast.success(r.reused ? "Reconnected to sandbox" : "Sandbox started");
      append(`[sandbox] ${r.reused ? "reusing" : "created"} ${r.sandboxId ?? ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sandbox failed");
    } finally {
      setStarting(false);
    }
  }, [append, projectId, threadId]);

  const runCmd = useCallback(async () => {
    const command = cmd.trim();
    if (!command || !projectId || !threadId || running) return;
    setRunning(true);
    append(`$ ${command}`);
    setCmd("");
    try {
      const r = await workspaceApi.postSandboxExec(projectId, threadId, {
        command,
        cwd: cwd.trim() || undefined,
      });
      const out = `${r.stdout ?? ""}${r.stderr ? (r.stdout ? "\n" : "") + r.stderr : ""}`.trimEnd();
      if (out) append(out);
      append(`[exit ${r.exitCode ?? "?"}]`);
    } catch (e) {
      append(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }, [append, cmd, cwd, projectId, running, threadId]);

  if (!projectId || !threadId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-xs text-muted-foreground">
        Open a thread to use the sandbox terminal.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-xs">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-2 py-1.5">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 gap-1 text-[11px]"
          disabled={starting}
          onClick={() => void startSandbox()}
        >
          {starting ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Start / reconnect sandbox
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 text-[10px] text-muted-foreground">cwd</span>
          <Input
            value={cwd}
            onChange={(e) => setCwd(e.target.value)}
            className="h-7 font-mono text-[11px]"
            placeholder={DEFAULT_SANDBOX_CWD}
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2 font-mono text-[11px] leading-relaxed">
        <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
          <TerminalIcon className="size-3.5" />
          <span>Commands run inside the thread E2B sandbox (sync files first if needed).</span>
        </div>
        <pre className="whitespace-pre-wrap break-all text-foreground">{lines.join("\n")}</pre>
        <div ref={endRef} />
      </div>
      <div className="flex shrink-0 gap-2 border-t border-border p-2">
        <Input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void runCmd();
            }
          }}
          className="h-9 font-mono text-[12px]"
          placeholder="npm run build"
          disabled={running}
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="button"
          size="sm"
          className="h-9 shrink-0"
          disabled={running || !cmd.trim()}
          onClick={() => void runCmd()}
        >
          {running ? <Loader2 className="size-4 animate-spin" /> : "Run"}
        </Button>
      </div>
    </div>
  );
}
