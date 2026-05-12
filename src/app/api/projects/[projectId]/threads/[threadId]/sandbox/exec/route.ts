import { CommandExitError } from "e2b";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectSandbox } from "@/lib/e2b/sandbox";
import { e2bWorkspaceRoot } from "@/lib/e2b/sync-project";
import { isE2BConfigured } from "@/lib/e2b/config";
import { getUserId } from "@/lib/session";
import * as workspace from "@/features/workspace/libs/workspace-service";

const BodySchema = z.object({
  command: z.string().min(1).max(8000),
  cwd: z.string().max(2048).optional(),
});

type Ctx = { params: Promise<{ projectId: string; threadId: string }> };

export async function POST(req: Request, ctx: Ctx) {
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
    return NextResponse.json(
      { error: "Start a sandbox first (POST …/sandbox), then run commands." },
      { status: 400 },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const root = e2bWorkspaceRoot();
  const cwd = body.cwd?.trim() ? body.cwd : root;

  try {
    const sandbox = await connectSandbox(thread.sandboxId);
    try {
      const result = await sandbox.commands.run(body.command, { cwd });
      return NextResponse.json({
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      });
    } catch (e) {
      if (e instanceof CommandExitError) {
        return NextResponse.json({
          exitCode: e.exitCode,
          stdout: e.stdout,
          stderr: e.stderr,
          error: e.error,
        });
      }
      throw e;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Command failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
