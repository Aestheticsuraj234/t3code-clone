export const workspaceKeys = {
  all: ["workspace"] as const,
  projects: () => [...workspaceKeys.all, "projects"] as const,
  project: (projectId: string) => [...workspaceKeys.all, "project", projectId] as const,
  threads: (projectId: string) => [...workspaceKeys.all, "threads", projectId] as const,
  messages: (projectId: string, threadId: string) =>
    [...workspaceKeys.all, "messages", projectId, threadId] as const,
  threadChanges: (projectId: string, threadId: string) =>
    [...workspaceKeys.all, "thread-changes", projectId, threadId] as const,
  projectFiles: (projectId: string) =>
    [...workspaceKeys.all, "project-files", projectId] as const,
  projectFileContent: (projectId: string, path: string) =>
    [...workspaceKeys.all, "project-file", projectId, path] as const,
  /** Prefix for invalidating all open file buffers for a project after sandbox pull. */
  projectFilePrefix: (projectId: string) => [...workspaceKeys.all, "project-file", projectId] as const,
};
