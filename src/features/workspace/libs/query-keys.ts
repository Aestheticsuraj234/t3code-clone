export const workspaceKeys = {
  all: ["workspace"] as const,
  projects: () => [...workspaceKeys.all, "projects"] as const,
  project: (projectId: string) => [...workspaceKeys.all, "project", projectId] as const,
  threads: (projectId: string) => [...workspaceKeys.all, "threads", projectId] as const,
  messages: (projectId: string, threadId: string) =>
    [...workspaceKeys.all, "messages", projectId, threadId] as const,
};
