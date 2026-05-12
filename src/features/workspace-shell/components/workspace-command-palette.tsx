"use client";

import {
  CloudDownload,
  CloudUpload,
  Cpu,
  PanelRight,
  SquareTerminal,
  Workflow,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import * as workspaceApi from "@/features/workspace/apis/workspace-client";

type Props = {
  projectId: string | null;
  threadId: string | null;
};

const PANEL_KEYS = ["changes", "files", "terminal"] as const;
type PanelKey = (typeof PANEL_KEYS)[number];

function isPanelKey(v: string): v is PanelKey {
  return (PANEL_KEYS as readonly string[]).includes(v);
}

export function WorkspaceCommandPalette({ projectId, threadId }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState<"sandbox" | "sync" | "pull" | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goPanel = useCallback(
    (panel: PanelKey) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("panel", panel);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
      setOpen(false);
    },
    [pathname, router, searchParams],
  );

  const startSandbox = useCallback(async () => {
    if (!projectId || !threadId) return;
    setBusy("sandbox");
    try {
      const r = await workspaceApi.postThreadSandbox(projectId, threadId);
      toast.success(r.reused ? "Sandbox reconnected" : "Sandbox started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sandbox failed");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }, [projectId, threadId]);

  const pullSandbox = useCallback(async () => {
    if (!projectId || !threadId) return;
    setBusy("pull");
    try {
      const r = await workspaceApi.postSandboxPull(projectId, threadId);
      toast.success(`Imported ${r.written ?? 0} files from sandbox`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Pull failed");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }, [projectId, threadId]);

  const syncSandbox = useCallback(async () => {
    if (!projectId || !threadId) return;
    setBusy("sync");
    try {
      const r = await workspaceApi.postSandboxSync(projectId, threadId);
      toast.success(`Synced ${r.written ?? 0} files to the sandbox`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }, [projectId, threadId]);

  const currentPanel = searchParams.get("panel");
  const panelLabel = isPanelKey(currentPanel ?? "") ? currentPanel : "changes";

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Workspace commands" showCloseButton>
      <Command shouldFilter className="rounded-xl">
        <CommandInput placeholder="Run a workspace command…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="Panels">
            <CommandItem onSelect={() => goPanel("changes")}>
              <Workflow className="size-4" />
              Open Changes
              {panelLabel === "changes" ? <CommandShortcut>current</CommandShortcut> : null}
            </CommandItem>
            <CommandItem onSelect={() => goPanel("files")}>
              <PanelRight className="size-4" />
              Open Files
              {panelLabel === "files" ? <CommandShortcut>current</CommandShortcut> : null}
            </CommandItem>
            <CommandItem onSelect={() => goPanel("terminal")}>
              <SquareTerminal className="size-4" />
              Open Sandbox terminal
              {panelLabel === "terminal" ? <CommandShortcut>current</CommandShortcut> : null}
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="E2B">
            <CommandItem
              disabled={!projectId || !threadId || busy !== null}
              onSelect={() => void startSandbox()}
            >
              <Cpu className="size-4" />
              Start or reconnect sandbox
              <CommandShortcut>{busy === "sandbox" ? "…" : "↵"}</CommandShortcut>
            </CommandItem>
            <CommandItem
              disabled={!projectId || !threadId || busy !== null}
              onSelect={() => void syncSandbox()}
            >
              <CloudUpload className="size-4" />
              Push DB → sandbox (all files)
              <CommandShortcut>{busy === "sync" ? "…" : "↵"}</CommandShortcut>
            </CommandItem>
            <CommandItem
              disabled={!projectId || !threadId || busy !== null}
              onSelect={() => void pullSandbox()}
            >
              <CloudDownload className="size-4" />
              Pull sandbox → DB
              <CommandShortcut>{busy === "pull" ? "…" : "↵"}</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
