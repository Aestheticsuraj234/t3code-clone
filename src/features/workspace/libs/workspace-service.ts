import { prisma } from "@/lib/prisma";
import { threadStatusIndicator } from "./thread-status-ui";

function projectCountsSelect() {
  return { threads: true, files: true } as const;
}

export async function listProjects(userId: string) {
  const rows = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: projectCountsSelect() } },
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    counts: { threads: p._count.threads, files: p._count.files },
  }));
}

export async function createProject(userId: string, name: string) {
  const project = await prisma.project.create({
    data: { ownerId: userId, name },
    include: { _count: { select: projectCountsSelect() } },
  });

  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    counts: { threads: project._count.threads, files: project._count.files },
  };
}

export async function getProject(userId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    include: { _count: { select: projectCountsSelect() } },
  });
}

export async function listThreads(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return null;

  const threads = await prisma.thread.findMany({
    where: { projectId },
    orderBy: { lastActivityAt: "desc" },
  });

  return threads.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    status: t.status,
    indicator: threadStatusIndicator(t.status),
    sandboxId: t.sandboxId,
    errorMessage: t.errorMessage,
    lastActivityAt: t.lastActivityAt,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
}

export async function createThread(userId: string, projectId: string, title: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return null;

  const thread = await prisma.thread.create({
    data: { projectId, title },
  });

  return {
    id: thread.id,
    projectId: thread.projectId,
    title: thread.title,
    status: thread.status,
    indicator: threadStatusIndicator(thread.status),
    sandboxId: thread.sandboxId,
    errorMessage: thread.errorMessage,
    lastActivityAt: thread.lastActivityAt,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
  };
}

export async function listMessages(userId: string, projectId: string, threadId: string) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return null;

  return prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });
}

export async function createUserMessage(
  userId: string,
  projectId: string,
  threadId: string,
  content: string,
) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return null;

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { threadId, role: "USER", content },
      select: { id: true, role: true, content: true, createdAt: true },
    }),
    prisma.thread.update({
      where: { id: threadId },
      data: { lastActivityAt: new Date() },
    }),
  ]);

  return message;
}
