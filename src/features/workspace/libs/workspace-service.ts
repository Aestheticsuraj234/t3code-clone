import type { Prisma } from "../../../../generated/client";
import { prisma } from "@/lib/prisma";
import { unifiedDiffToLines, type DiffLine } from "@/lib/diff/unified-diff-lines";
import type { ThreadStatus } from "../../../../generated/enums";

import { threadStatusIndicator } from "./thread-status-ui";

export type { DiffLine };

export type PendingChangeRow = {
  id: string;
  path: string;
  kind: "ADD" | "EDIT" | "DELETE";
  added: number;
  removed: number;
  diff: DiffLine[];
};

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
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
      toolCalls: {
        select: { id: true, name: true, input: true, output: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
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

export async function createUserMessageWithId(
  userId: string,
  projectId: string,
  threadId: string,
  messageId: string,
  content: string,
) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return null;

  try {
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { id: messageId, threadId, role: "USER", content },
        select: { id: true, role: true, content: true, createdAt: true },
      }),
      prisma.thread.update({
        where: { id: threadId },
        data: { lastActivityAt: new Date(), status: "RUNNING" },
      }),
    ]);
    return message;
  } catch {
    return null;
  }
}

export async function getThreadWithSandbox(userId: string, projectId: string, threadId: string) {
  return prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true, sandboxId: true },
  });
}

export async function setThreadSandboxId(
  userId: string,
  projectId: string,
  threadId: string,
  sandboxId: string | null,
) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return false;

  await prisma.thread.update({
    where: { id: threadId },
    data: {
      sandboxId,
      lastActivityAt: new Date(),
    },
  });
  return true;
}

export async function setThreadStatus(
  userId: string,
  projectId: string,
  threadId: string,
  status: ThreadStatus,
  errorMessage?: string | null,
) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return false;

  await prisma.thread.update({
    where: { id: threadId },
    data: {
      status,
      errorMessage: errorMessage ?? null,
      lastActivityAt: new Date(),
    },
  });
  return true;
}

export async function saveAssistantAfterAgentRun(
  userId: string,
  projectId: string,
  threadId: string,
  text: string,
  toolRecords: Array<{ name: string; input: unknown; output: unknown }>,
  messageId?: string,
) {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return null;

  return prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        ...(messageId ? { id: messageId } : {}),
        threadId,
        role: "ASSISTANT",
        content: text,
        toolCalls: {
          create: toolRecords.map((t) => ({
            name: t.name,
            input: t.input as Prisma.InputJsonValue,
            output:
              t.output === undefined
                ? undefined
                : (JSON.parse(JSON.stringify(t.output)) as Prisma.InputJsonValue),
            status: "OK",
          })),
        },
      },
    });

    await tx.thread.update({
      where: { id: threadId },
      data: { status: "COMPLETED", lastActivityAt: new Date(), errorMessage: null },
    });

    return message;
  });
}

export async function listPendingFileChanges(
  userId: string,
  projectId: string,
  threadId: string,
): Promise<PendingChangeRow[] | null> {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return null;

  const rows = await prisma.fileChange.findMany({
    where: { threadId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((c) => {
    const oldStr = c.oldContent ?? "";
    const newStr = c.newContent ?? "";
    const { lines, added, removed } = unifiedDiffToLines(c.path, oldStr, newStr);
    return {
      id: c.id,
      path: c.path,
      kind: c.kind,
      added,
      removed,
      diff: lines,
    };
  });
}

export async function acceptPendingFileChanges(
  userId: string,
  projectId: string,
  threadId: string,
  ids?: string[],
): Promise<{ count: number } | null> {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return null;

  const changes = await prisma.fileChange.findMany({
    where: {
      threadId,
      status: "PENDING",
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
  });
  if (!changes.length) return { count: 0 };

  await prisma.$transaction(async (tx) => {
    for (const c of changes) {
      if (c.kind === "DELETE") {
        await tx.projectFile.deleteMany({
          where: { projectId, path: c.path },
        });
      }
      await tx.fileChange.update({
        where: { id: c.id },
        data: { status: "ACCEPTED" },
      });
    }
  });

  return { count: changes.length };
}

export async function rejectPendingFileChanges(
  userId: string,
  projectId: string,
  threadId: string,
  ids?: string[],
): Promise<{ count: number } | null> {
  const thread = await prisma.thread.findFirst({
    where: { id: threadId, projectId, project: { ownerId: userId } },
    select: { id: true },
  });
  if (!thread) return null;

  const changes = await prisma.fileChange.findMany({
    where: {
      threadId,
      status: "PENDING",
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
  });
  if (!changes.length) return { count: 0 };

  await prisma.$transaction(async (tx) => {
    for (const c of changes) {
      if (c.kind === "ADD") {
        await tx.projectFile.deleteMany({ where: { projectId, path: c.path } });
      } else if (c.kind === "EDIT") {
        const revert = c.oldContent;
        if (revert != null) {
          const size = Buffer.byteLength(revert, "utf8");
          await tx.projectFile.update({
            where: { projectId_path: { projectId, path: c.path } },
            data: { content: revert, size },
          });
        }
      } else if (c.kind === "DELETE" && c.oldContent != null) {
        const content = c.oldContent;
        await tx.projectFile.upsert({
          where: { projectId_path: { projectId, path: c.path } },
          create: {
            projectId,
            path: c.path,
            content,
            size: Buffer.byteLength(content, "utf8"),
          },
          update: {
            content,
            size: Buffer.byteLength(content, "utf8"),
          },
        });
      }
      await tx.fileChange.update({
        where: { id: c.id },
        data: { status: "REJECTED" },
      });
    }
  });

  return { count: changes.length };
}

export async function listProjectFilePaths(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return null;

  return prisma.projectFile.findMany({
    where: { projectId },
    select: { path: true, size: true },
    orderBy: { path: "asc" },
  });
}

export async function getProjectFileContent(userId: string, projectId: string, pathParam: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return null;

  return prisma.projectFile.findUnique({
    where: { projectId_path: { projectId, path: pathParam } },
    select: { path: true, content: true },
  });
}

export async function listProjectFilesForSync(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return null;

  return prisma.projectFile.findMany({
    where: { projectId },
    select: { path: true, content: true },
  });
}

export async function upsertProjectFileContent(
  userId: string,
  projectId: string,
  pathParam: string,
  content: string,
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return false;

  const size = Buffer.byteLength(content, "utf8");
  await prisma.projectFile.upsert({
    where: { projectId_path: { projectId, path: pathParam } },
    create: { projectId, path: pathParam, content, size },
    update: { content, size },
  });
  return true;
}

export async function bulkUpsertProjectFilesFromSandbox(
  userId: string,
  projectId: string,
  files: Array<{ path: string; content: string }>,
): Promise<number> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return 0;

  if (files.length === 0) return 0;

  const CHUNK = 80;
  let total = 0;
  for (let i = 0; i < files.length; i += CHUNK) {
    const slice = files.slice(i, i + CHUNK);
    await prisma.$transaction(
      slice.map((f) => {
        const size = Buffer.byteLength(f.content, "utf8");
        return prisma.projectFile.upsert({
          where: { projectId_path: { projectId, path: f.path } },
          create: { projectId, path: f.path, content: f.content, size },
          update: { content: f.content, size },
        });
      }),
    );
    total += slice.length;
  }
  return total;
}
