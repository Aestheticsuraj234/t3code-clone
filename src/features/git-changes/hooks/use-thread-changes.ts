"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { PendingChangeRow } from "@/features/workspace/libs/workspace-service";
import * as workspaceApi from "@/features/workspace/apis/workspace-client";
import { workspaceKeys } from "@/features/workspace/libs/query-keys";

export function useThreadChanges(projectId: string | null, threadId: string | null) {
  const query = useQuery({
    queryKey:
      projectId && threadId
        ? workspaceKeys.threadChanges(projectId, threadId)
        : ["workspace", "thread-changes", "disabled"],
    queryFn: () => workspaceApi.getThreadChanges(projectId!, threadId!),
    enabled: !!projectId && !!threadId,
  });

  const changes: PendingChangeRow[] = query.data?.changes ?? [];
  const totals = query.data?.totals ?? { added: 0, removed: 0, files: 0 };

  const [activeId, setActiveId] = useState<string | null>(null);

  const activeChange = useMemo(
    () => changes.find((c) => c.id === activeId) ?? changes[0],
    [changes, activeId],
  );

  useEffect(() => {
    if (changes.length === 0) {
      setActiveId(null);
      return;
    }
    const stillValid = activeId && changes.some((c) => c.id === activeId);
    if (!stillValid) {
      setActiveId(changes[0]!.id);
    }
  }, [changes, activeId]);

  return {
    changes,
    totals,
    activeId,
    setActiveId,
    activeChange,
    isLoading: query.isPending,
    refetch: query.refetch,
  };
}
