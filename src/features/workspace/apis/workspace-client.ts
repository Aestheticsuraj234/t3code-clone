/** Browser fetch helpers for TanStack Query (same shapes as `/api/projects` routes). */

export async function getProjects() {
  const res = await fetch("/api/projects", { credentials: "include" });
  const json = (await res.json()) as { projects?: unknown; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.projects;
}

export async function postProject(body: { name: string }) {
  const res = await fetch("/api/projects", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { project?: unknown; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.project;
}

export async function getProject(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}`, { credentials: "include" });
  const json = (await res.json()) as { project?: unknown; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.project;
}

export async function getThreads(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/threads`, { credentials: "include" });
  const json = (await res.json()) as { threads?: unknown; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.threads;
}

export async function postThread(projectId: string, body: { title: string }) {
  const res = await fetch(`/api/projects/${projectId}/threads`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { thread?: unknown; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.thread;
}

export async function getMessages(projectId: string, threadId: string) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/messages`, {
    credentials: "include",
  });
  const json = (await res.json()) as { messages?: unknown; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.messages;
}

export async function postThreadMessage(projectId: string, threadId: string, body: { content: string }) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { message?: unknown; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.message;
}

/** Create or reconnect an E2B sandbox for this thread (requires E2B_API_KEY on the server). */
export async function postThreadSandbox(projectId: string, threadId: string) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/sandbox`, {
    method: "POST",
    credentials: "include",
  });
  const json = (await res.json()) as { sandboxId?: string; reused?: boolean; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export async function deleteThreadSandbox(projectId: string, threadId: string) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/sandbox`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = (await res.json()) as { ok?: boolean; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export async function getThreadChanges(projectId: string, threadId: string) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/changes`, {
    credentials: "include",
  });
  const json = (await res.json()) as {
    changes?: import("@/features/workspace/libs/workspace-service").PendingChangeRow[];
    totals?: { added: number; removed: number; files: number };
    error?: string;
  };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return {
    changes: json.changes ?? [],
    totals: json.totals ?? { added: 0, removed: 0, files: 0 },
  };
}

export async function postThreadChanges(
  projectId: string,
  threadId: string,
  body: { action: "accept" | "reject"; ids?: string[] },
) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/changes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { count?: number; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export async function getProjectFiles(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/files`, { credentials: "include" });
  const json = (await res.json()) as { files?: { path: string; size: number }[]; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.files ?? [];
}

export async function getProjectFile(projectId: string, path: string) {
  const q = new URLSearchParams({ path });
  const res = await fetch(`/api/projects/${projectId}/file?${q}`, { credentials: "include" });
  const json = (await res.json()) as { path?: string; content?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export async function postSandboxExec(
  projectId: string,
  threadId: string,
  body: { command: string; cwd?: string },
) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/sandbox/exec`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    error?: string;
  };
  if (!res.ok) throw new Error(json.error ?? "Command failed");
  return json;
}

export async function postSandboxSync(projectId: string, threadId: string) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/sandbox/sync`, {
    method: "POST",
    credentials: "include",
  });
  const json = (await res.json()) as { written?: number; sandboxId?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export async function postSandboxPull(projectId: string, threadId: string) {
  const res = await fetch(`/api/projects/${projectId}/threads/${threadId}/sandbox/pull`, {
    method: "POST",
    credentials: "include",
  });
  const json = (await res.json()) as {
    written?: number;
    stats?: unknown;
    message?: string;
    error?: string;
  };
  if (!res.ok) throw new Error(json.error ?? "Pull failed");
  return json;
}

export async function putProjectFile(
  projectId: string,
  body: { path: string; content: string },
  threadId?: string | null,
) {
  const q = threadId ? `?threadId=${encodeURIComponent(threadId)}` : "";
  const res = await fetch(`/api/projects/${projectId}/file${q}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { path?: string; sandboxWritten?: boolean; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Save failed");
  return json;
}
