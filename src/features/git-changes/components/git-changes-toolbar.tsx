"use client";

import { CloudDownload, CloudUpload, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import * as workspaceApi from "@/features/workspace/apis/workspace-client";
import { workspaceKeys } from "@/features/workspace/libs/query-keys";

type Props = {
  projectId: string | null;
  threadId: string | null;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSyncSandbox: () => void;
  onPullSandbox: () => void;
  acceptPending: boolean;
  rejectPending: boolean;
  syncPending: boolean;
  pullPending: boolean;
  hasPending: boolean;
};

export function GitChangesToolbar({
  projectId,
  threadId,
  onAcceptAll,
  onRejectAll,
  onSyncSandbox,
  onPullSandbox,
  acceptPending,
  rejectPending,
  syncPending,
  pullPending,
  hasPending,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground">
          Pending review
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={!projectId || !threadId || !hasPending || acceptPending || rejectPending}
          onClick={onAcceptAll}
        >
          {acceptPending ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : null}
          Accept all
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={!projectId || !threadId || !hasPending || acceptPending || rejectPending}
          onClick={onRejectAll}
        >
          {rejectPending ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : null}
          Reject all
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={!projectId || !threadId || syncPending}
          onClick={onSyncSandbox}
          title="Push all database project files into the E2B workspace (start sandbox first)"
        >
          {syncPending ? <Loader2 className="size-3.5 animate-spin" /> : <CloudUpload className="size-3.5" />}
          Push to sandbox
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={!projectId || !threadId || pullPending}
          onClick={onPullSandbox}
          title="Import files from the sandbox workspace into the database (npm installs etc. stay in sandbox only unless under the workspace root)"
        >
          {pullPending ? <Loader2 className="size-3.5 animate-spin" /> : <CloudDownload className="size-3.5" />}
          Pull from sandbox
        </Button>
      </div>
    </div>
  );
}

export function useChangesMutations(projectId: string | null, threadId: string | null) {
  const qc = useQueryClient();

  const invalidate = () => {
    if (!projectId || !threadId) return;
    void qc.invalidateQueries({ queryKey: workspaceKeys.threadChanges(projectId, threadId) });
    void qc.invalidateQueries({ queryKey: workspaceKeys.projectFiles(projectId) });
  };

  const acceptMutation = useMutation({
    mutationFn: (ids?: string[]) => {
      if (!projectId || !threadId) throw new Error("No thread");
      return workspaceApi.postThreadChanges(projectId, threadId, { action: "accept", ids });
    },
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (ids?: string[]) => {
      if (!projectId || !threadId) throw new Error("No thread");
      return workspaceApi.postThreadChanges(projectId, threadId, { action: "reject", ids });
    },
    onSuccess: invalidate,
  });

  const syncMutation = useMutation({
    mutationFn: () => {
      if (!projectId || !threadId) throw new Error("No thread");
      return workspaceApi.postSandboxSync(projectId, threadId);
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.written ?? 0} file(s) to the sandbox`);
      if (!projectId || !threadId) return;
      void qc.invalidateQueries({ queryKey: workspaceKeys.projectFiles(projectId) });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Sandbox sync failed");
    },
  });

  const pullMutation = useMutation({
    mutationFn: () => {
      if (!projectId || !threadId) throw new Error("No thread");
      return workspaceApi.postSandboxPull(projectId, threadId);
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.written ?? 0} file(s) from the sandbox`);
      if (!projectId || !threadId) return;
      void qc.invalidateQueries({ queryKey: workspaceKeys.projectFiles(projectId) });
      void qc.invalidateQueries({ queryKey: workspaceKeys.projectFilePrefix(projectId) });
      void qc.invalidateQueries({ queryKey: workspaceKeys.threadChanges(projectId, threadId) });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Pull failed");
    },
  });

  return { acceptMutation, rejectMutation, syncMutation, pullMutation };
}
