"use client";

import { useThreadChanges } from "../hooks/use-thread-changes";
import { ChangedFilesList } from "./changed-files-list";
import { ChangesDiffView } from "./changes-diff-view";
import { GitChangesToolbar, useChangesMutations } from "./git-changes-toolbar";

export function GitChangesPanel({ projectId, threadId }: { projectId: string | null; threadId: string | null }) {
  const { changes, totals, activeId, setActiveId, activeChange, isLoading } = useThreadChanges(
    projectId,
    threadId,
  );
  const { acceptMutation, rejectMutation, syncMutation, pullMutation } = useChangesMutations(projectId, threadId);

  if (!projectId || !threadId) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-muted-foreground">
        Open a thread to review pending edits from the agent.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <GitChangesToolbar
        projectId={projectId}
        threadId={threadId}
        onAcceptAll={() => acceptMutation.mutate(undefined)}
        onRejectAll={() => rejectMutation.mutate(undefined)}
        onSyncSandbox={() => syncMutation.mutate()}
        onPullSandbox={() => pullMutation.mutate()}
        acceptPending={acceptMutation.isPending}
        rejectPending={rejectMutation.isPending}
        syncPending={syncMutation.isPending}
        pullPending={pullMutation.isPending}
        hasPending={changes.length > 0}
      />
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Loading changes…
        </div>
      ) : (
        <>
          <ChangedFilesList
            changes={changes}
            totals={totals}
            activeId={activeId}
            onSelect={setActiveId}
          />
          <ChangesDiffView
            change={activeChange}
            onAccept={(id) => acceptMutation.mutate([id])}
            onReject={(id) => rejectMutation.mutate([id])}
            actionPending={acceptMutation.isPending || rejectMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
