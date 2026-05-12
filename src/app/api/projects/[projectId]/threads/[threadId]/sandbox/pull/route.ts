import { NextResponse } from "next/server";

import * as workspace from "@/features/workspace/libs/workspace-service";
import { connectSandbox } from "@/lib/e2b/sandbox";
import { readSandboxWorkspaceTree } from "@/lib/e2b/sync-project";
import { isE2BConfigured } from "@/lib/e2b/config";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ projectId: string; threadId: string }> };

/**
 * Copy all files from the sandbox workspace directory into project files in the database.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isE2BConfigured()) {
    return NextResponse.json({ error: "E2B is not configured" }, { status: 503 });
  }

  const { projectId, threadId } = await ctx.params;
  const thread = await workspace.getThreadWithSandbox(userId, projectId, threadId);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!thread.sandboxId) {
    return NextResponse.json({ error: "Start a sandbox first, then pull." }, { status: 400 });
  }

  try {
    const sandbox = await connectSandbox(thread.sandboxId);
    const { files: treeFiles, stats } = await readSandboxWorkspaceTree(sandbox);
    const written = await workspace.bulkUpsertProjectFilesFromSandbox(userId, projectId, treeFiles);
    if (written === 0 && treeFiles.length === 0) {
      return NextResponse.json({
        written: 0,
        stats,
        message: "No text files found under the workspace root (or all skipped).",
      });
    }
    return NextResponse.json({ written, stats });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Pull failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
