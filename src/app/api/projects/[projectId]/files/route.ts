import { NextResponse } from "next/server";

import * as workspace from "@/features/workspace/libs/workspace-service";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const files = await workspace.listProjectFilePaths(userId, projectId);
  if (files === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ files });
}
