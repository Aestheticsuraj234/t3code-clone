import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import * as workspace from "@/features/workspace/libs/workspace-service";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const project = await workspace.getProject(userId, projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      counts: {
        threads: project._count.threads,
        files: project._count.files,
      },
    },
  });
}
