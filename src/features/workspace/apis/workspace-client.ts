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
