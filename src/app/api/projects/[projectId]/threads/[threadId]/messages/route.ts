import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { createMessageBody } from "@/features/workspace/libs/schemas";
import * as workspace from "@/features/workspace/libs/workspace-service";

type Ctx = { params: Promise<{ projectId: string; threadId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, threadId } = await ctx.params;
  const messages = await workspace.listMessages(userId, projectId, threadId);
  if (messages === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, threadId } = await ctx.params;
  const body = createMessageBody.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const message = await workspace.createUserMessage(userId, projectId, threadId, body.data.content);
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
