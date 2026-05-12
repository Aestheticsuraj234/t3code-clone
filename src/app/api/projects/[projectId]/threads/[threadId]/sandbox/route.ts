import { NextResponse } from "next/server";

import * as workspace from "@/features/workspace/libs/workspace-service";
import { isE2BConfigured } from "@/lib/e2b/config";
import { connectSandbox, createSandboxForThread, killSandbox } from "@/lib/e2b/sandbox";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ projectId: string; threadId: string }> };

/**
 * Start (or reuse) an E2B sandbox for this thread and persist `Thread.sandboxId`.
 * @see https://e2b.dev/docs
 */
export async function POST(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isE2BConfigured()) {
    return NextResponse.json(
      { error: "E2B is not configured. Set E2B_API_KEY in the environment." },
      { status: 503 },
    );
  }

  const { projectId, threadId } = await ctx.params;

  const thread = await workspace.getThreadWithSandbox(userId, projectId, threadId);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (thread.sandboxId) {
    try {
      const sandbox = await connectSandbox(thread.sandboxId);
      await workspace.setThreadSandboxId(userId, projectId, threadId, sandbox.sandboxId);
      return NextResponse.json({ sandboxId: sandbox.sandboxId, reused: true });
    } catch {
      await workspace.setThreadSandboxId(userId, projectId, threadId, null);
    }
  }

  try {
    const sandbox = await createSandboxForThread({ projectId, threadId, userId });
    const ok = await workspace.setThreadSandboxId(userId, projectId, threadId, sandbox.sandboxId);
    if (!ok) {
      await sandbox.kill();
      return NextResponse.json({ error: "Failed to save sandbox" }, { status: 500 });
    }
    return NextResponse.json({ sandboxId: sandbox.sandboxId, reused: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : "E2B sandbox failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** Kill the E2B sandbox for this thread and clear `Thread.sandboxId`. */
export async function DELETE(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isE2BConfigured()) {
    return NextResponse.json(
      { error: "E2B is not configured. Set E2B_API_KEY in the environment." },
      { status: 503 },
    );
  }

  const { projectId, threadId } = await ctx.params;

  const thread = await workspace.getThreadWithSandbox(userId, projectId, threadId);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (thread.sandboxId) {
    try {
      await killSandbox(thread.sandboxId);
    } catch {
      /* still clear DB so UI is not stuck on a dead id */
    }
  }

  await workspace.setThreadSandboxId(userId, projectId, threadId, null);
  return NextResponse.json({ ok: true });
}
