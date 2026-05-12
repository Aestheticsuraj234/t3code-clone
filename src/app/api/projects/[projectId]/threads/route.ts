import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { createThreadBody } from "@/features/workspace/libs/schemas";
import * as workspace from "@/features/workspace/libs/workspace-service";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const threads = await workspace.listThreads(userId, projectId);
  if (threads === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ threads });
}

export async function POST(req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const body = createThreadBody.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const thread = await workspace.createThread(userId, projectId, body.data.title);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ thread }, { status: 201 });
}
