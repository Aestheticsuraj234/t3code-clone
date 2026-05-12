"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

import { messagesToChatBlocks } from "@/features/agent-chat/libs/messages-to-blocks";
import type { AgentThread } from "@/features/agent-chat/libs/mock-chat";
import type { ProjectSidebarSection } from "@/features/project-sidebar/libs/sidebar-types";
import * as workspaceApi from "@/features/workspace/apis/workspace-client";
import { workspaceKeys } from "@/features/workspace/libs/query-keys";
import { threadWorkspacePath } from "../libs/routes";
import type { MessageRole } from "../../../../generated/browser";
import type { ThreadStatusIndicator } from "@/features/workspace/libs/thread-status-ui";

type ProjectRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  counts: { threads: number; files: number };
};

type ThreadRow = {
  id: string;
  projectId: string;
  title: string;
  indicator: ThreadStatusIndicator;
};

type MessageRow = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type WorkbenchRoute = {
  projectId: string | null;
  threadId: string | null;
};

function parseRowKey(key: string | null) {
  if (!key?.includes(":")) return { projectId: null as string | null, threadId: null as string | null };
  const [projectId, threadId] = key.split(":");
  return { projectId, threadId };
}

function rowKey(projectId: string, threadId: string) {
  return `${projectId}:${threadId}`;
}

export function useWorkbench(route: WorkbenchRoute) {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();

  const routeProjectId = route.projectId;
  const routeThreadId = route.threadId;
  const hasRoute = !!routeProjectId && !!routeThreadId;

  const projectsQuery = useQuery({
    queryKey: workspaceKeys.projects(),
    queryFn: () => workspaceApi.getProjects() as Promise<ProjectRow[]>,
  });

  const threadQueryDefs = useMemo(
    () =>
      (projectsQuery.data ?? []).map((p) => ({
        queryKey: workspaceKeys.threads(p.id),
        queryFn: () => workspaceApi.getThreads(p.id) as Promise<ThreadRow[]>,
        enabled: projectsQuery.isSuccess && (projectsQuery.data?.length ?? 0) > 0,
      })),
    [projectsQuery.data, projectsQuery.isSuccess],
  );

  const threadQueries = useQueries({ queries: threadQueryDefs });

  const sections: ProjectSidebarSection[] = useMemo(() => {
    const list = projectsQuery.data ?? [];
    return list.map((p, i) => {
      const threads = (threadQueries[i]?.data ?? []) as ThreadRow[];
      return {
        projectId: p.id,
        heading: p.name,
        items: threads.map((t) => ({
          threadId: t.id,
          projectId: t.projectId,
          title: t.title,
          indicator: t.indicator,
          rowKey: rowKey(t.projectId, t.id),
        })),
      };
    });
  }, [projectsQuery.data, threadQueries]);

  const defaultKey = useMemo(() => {
    for (const sec of sections) {
      const first = sec.items[0];
      if (first) return first.rowKey;
    }
    return null;
  }, [sections]);

  const activeKeyForUi = hasRoute ? rowKey(routeProjectId!, routeThreadId!) : (defaultKey ?? "");

  const msgIds = useMemo(() => {
    if (hasRoute && routeProjectId && routeThreadId) {
      return { projectId: routeProjectId, threadId: routeThreadId };
    }
    return parseRowKey(defaultKey);
  }, [hasRoute, routeProjectId, routeThreadId, defaultKey]);

  const messagesQuery = useQuery({
    queryKey: workspaceKeys.messages(msgIds.projectId ?? "", msgIds.threadId ?? ""),
    queryFn: () =>
      workspaceApi.getMessages(msgIds.projectId!, msgIds.threadId!) as Promise<MessageRow[]>,
    enabled: !!msgIds.projectId && !!msgIds.threadId,
  });

  const selectedThread = useMemo(() => {
    if (!activeKeyForUi) return null;
    for (const sec of sections) {
      for (const it of sec.items) {
        if (it.rowKey === activeKeyForUi) return it;
      }
    }
    return null;
  }, [sections, activeKeyForUi]);

  const thread: AgentThread = useMemo(() => {
    const title = selectedThread?.title ?? (hasRoute ? "Thread" : "Chat");
    const messages = messagesQuery.data ?? [];
    return {
      id: msgIds.threadId ?? "draft",
      title,
      blocks: messagesToChatBlocks(messages),
    };
  }, [selectedThread, messagesQuery.data, msgIds.threadId, hasRoute]);

  useEffect(() => {
    if (hasRoute) return;
    if (pathname !== "/") return;
    if (!defaultKey) return;
    const { projectId, threadId } = parseRowKey(defaultKey);
    if (!projectId || !threadId) return;
    router.replace(threadWorkspacePath(projectId, threadId));
  }, [hasRoute, pathname, defaultKey, router]);

  const createProject = useMutation({
    mutationFn: () => workspaceApi.postProject({ name: "My workspace" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: workspaceKeys.projects() });
    },
  });

  const newAgent = useMutation({
    mutationFn: async () => {
      let pid = hasRoute ? routeProjectId : msgIds.projectId;
      const list = projectsQuery.data ?? [];
      if (!pid && list[0]) pid = list[0].id;
      if (!pid) {
        const p = (await workspaceApi.postProject({ name: "My workspace" })) as ProjectRow;
        pid = p.id;
        void qc.invalidateQueries({ queryKey: workspaceKeys.projects() });
      }
      const t = (await workspaceApi.postThread(pid!, { title: "New agent" })) as ThreadRow;
      return { projectId: pid!, threadId: t.id };
    },
    onSuccess: ({ projectId, threadId }) => {
      void qc.invalidateQueries({ queryKey: workspaceKeys.projects() });
      void qc.invalidateQueries({ queryKey: workspaceKeys.threads(projectId) });
      router.push(threadWorkspacePath(projectId, threadId));
    },
  });

  const sendMessage = useMutation({
    mutationFn: (vars: { content: string; projectId: string; threadId: string }) =>
      workspaceApi.postThreadMessage(vars.projectId, vars.threadId, { content: vars.content }),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: workspaceKeys.messages(vars.projectId, vars.threadId) });
      void qc.invalidateQueries({ queryKey: workspaceKeys.threads(vars.projectId) });
    },
  });

  const onSidebarPick = useCallback(
    (rowKey: string) => {
      const { projectId, threadId } = parseRowKey(rowKey);
      if (!projectId || !threadId) return;
      router.push(threadWorkspacePath(projectId, threadId));
    },
    [router],
  );

  const onSend = useCallback(
    (text: string) => {
      if (!msgIds.projectId || !msgIds.threadId) return;
      sendMessage.mutate({
        content: text,
        projectId: msgIds.projectId,
        threadId: msgIds.threadId,
      });
    },
    [msgIds.projectId, msgIds.threadId, sendMessage],
  );

  const emptyProjects = projectsQuery.isSuccess && (projectsQuery.data?.length ?? 0) === 0;

  return {
    sections,
    activeId: activeKeyForUi,
    onSidebarPick,
    thread,
    branchLabel: "local master",
    contextPercent: 64,
    messagesLoading: messagesQuery.isPending,
    statusIndicator: selectedThread?.indicator ?? null,
    onSend,
    sendPending: sendMessage.isPending,
    onNewAgent: () => newAgent.mutate(),
    newAgentPending: newAgent.isPending,
    onCreateWorkspace: () => createProject.mutate(),
    createWorkspacePending: createProject.isPending,
    emptyProjects,
    sidebarLoading: projectsQuery.isPending,
  };
}
