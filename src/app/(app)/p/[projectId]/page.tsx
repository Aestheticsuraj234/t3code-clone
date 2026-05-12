import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { threadWorkspacePath } from "@/features/workspace-shell/libs/routes";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectRedirectPage({ params }: Props) {
  const { projectId } = await params;
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const thread = await prisma.thread.findFirst({
    where: { projectId, project: { ownerId: session.user.id } },
    orderBy: { lastActivityAt: "desc" },
    select: { id: true },
  });

  if (!thread) {
    redirect("/");
  }

  redirect(threadWorkspacePath(projectId, thread.id));
}
