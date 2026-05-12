import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { createProjectBody } from "@/features/workspace/libs/schemas";
import * as workspace from "@/features/workspace/libs/workspace-service";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await workspace.listProjects(userId);
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createProjectBody.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const project = await workspace.createProject(userId, body.data.name);
  return NextResponse.json({ project }, { status: 201 });
}
