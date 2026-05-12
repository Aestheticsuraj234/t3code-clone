import { NextResponse } from "next/server";
import { z } from "zod";

import * as workspace from "@/features/workspace/libs/workspace-service";
import { connectSandbox } from "@/lib/e2b/sandbox";
import { writeProjectFileToSandbox } from "@/lib/e2b/sync-project";
import { isE2BConfigured } from "@/lib/e2b/config";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ projectId: string }> };

const PutBody = z.object({
  path: z.string().min(1).max(2048),
  content: z.string(),
});

export async function GET(req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const pathParam = new URL(req.url).searchParams.get("path");
  if (!pathParam) {
    return NextResponse.json({ error: "Missing path query" }, { status: 400 });
  }

  const row = await workspace.getProjectFileContent(userId, projectId, pathParam);
  if (row === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

/**
 * Save file content to the database. Optional `threadId` query pushes the same file into the thread sandbox.
 */
export async function PUT(req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  let body: z.infer<typeof PutBody>;
  try {
    body = PutBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const ok = await workspace.upsertProjectFileContent(userId, projectId, body.path, body.content);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const threadId = new URL(req.url).searchParams.get("threadId")?.trim() || null;
  let sandboxWritten = false;

  if (threadId && isE2BConfigured()) {
    const thread = await workspace.getThreadWithSandbox(userId, projectId, threadId);
    if (thread?.sandboxId) {
      try {
        const sandbox = await connectSandbox(thread.sandboxId);
        await writeProjectFileToSandbox(sandbox, body.path, body.content);
        sandboxWritten = true;
      } catch {
        /* sandbox stale — file is still saved in DB */
      }
    }
  }

  return NextResponse.json({ path: body.path, sandboxWritten });
}
