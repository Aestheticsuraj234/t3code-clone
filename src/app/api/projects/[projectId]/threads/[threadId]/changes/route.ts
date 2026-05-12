import { NextResponse } from "next/server";
import { z } from "zod";

import * as workspace from "@/features/workspace/libs/workspace-service";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ projectId: string; threadId: string }> };

const postBody = z.object({
  action: z.enum(["accept", "reject"]),
  /** When omitted or empty, applies to all pending changes. */
  ids: z.array(z.string()).optional(),
});

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, threadId } = await ctx.params;
  const rows = await workspace.listPendingFileChanges(userId, projectId, threadId);
  if (rows === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc.added += r.added;
      acc.removed += r.removed;
      return acc;
    },
    { added: 0, removed: 0, files: rows.length },
  );

  return NextResponse.json({ changes: rows, totals });
}

export async function POST(req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, threadId } = await ctx.params;
  const json = postBody.safeParse(await req.json());
  if (!json.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { action, ids } = json.data;
  const idList = ids?.length ? ids : undefined;

  if (action === "accept") {
    const result = await workspace.acceptPendingFileChanges(userId, projectId, threadId, idList);
    if (result === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  }

  const result = await workspace.rejectPendingFileChanges(userId, projectId, threadId, idList);
  if (result === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}
