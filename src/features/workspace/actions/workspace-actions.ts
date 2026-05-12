"use server";

import { getUserId } from "@/lib/session";
import { createProjectBody, createThreadBody } from "@/features/workspace/libs/schemas";
import * as workspace from "@/features/workspace/libs/workspace-service";

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };
type Result<T> = Ok<T> | Err;

export async function createProjectAction(input: unknown): Promise<Result<Awaited<ReturnType<typeof workspace.createProject>>>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const parsed = createProjectBody.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const project = await workspace.createProject(userId, parsed.data.name);
  return { ok: true, data: project };
}

export async function createThreadAction(
  projectId: string,
  input: unknown,
): Promise<Result<NonNullable<Awaited<ReturnType<typeof workspace.createThread>>>>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const parsed = createThreadBody.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const thread = await workspace.createThread(userId, projectId, parsed.data.title);
  if (!thread) return { ok: false, error: "Not found" };

  return { ok: true, data: thread };
}
