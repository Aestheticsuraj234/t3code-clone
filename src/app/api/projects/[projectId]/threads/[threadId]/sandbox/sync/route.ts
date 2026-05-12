import { NextResponse } from "next/server";

import * as workspace from "@/features/workspace/libs/workspace-service";
import { isE2BConfigured } from "@/lib/e2b/config";
import { connectSandbox } from "@/lib/e2b/sandbox";
import { writeAllProjectFilesToSandbox } from "@/lib/e2b/sync-project";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ projectId: string; threadId: string }> };

/**
 * Copy all project files from the DB workspace into the thread's E2B sandbox.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isE2BConfigured()) {
    return NextResponse.json(
      { error: "Set E2B_API_KEY to sync files into a sandbox." },
      { status: 503 },
    );
  }

  const { projectId, threadId } = await ctx.params;

  const thread = await workspace.getThreadWithSandbox(userId, projectId, threadId);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!thread.sandboxId) {
    return NextResponse.json(
      { error: "Start a sandbox first (POST …/sandbox), then sync." },
      { status: 400 },
    );
  }

  const files = await workspace.listProjectFilesForSync(userId, projectId);
  if (files === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const sandbox = await connectSandbox(thread.sandboxId);
    const written = await writeAllProjectFilesToSandbox(sandbox, files);
    return NextResponse.json({ written, sandboxId: sandbox.sandboxId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "E2B sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
