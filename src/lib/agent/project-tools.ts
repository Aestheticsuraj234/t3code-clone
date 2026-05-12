import { createTwoFilesPatch } from "diff";
import { tool } from "ai";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

import { safeProjectRelativePath } from "./safe-path";

async function ensureProjectAccess(userId: string, projectId: string) {
  const p = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!p) throw new Error("Project not found");
}

export function createProjectAgentTools(args: { userId: string; projectId: string; threadId: string }) {
  const { userId, projectId, threadId } = args;

  const read_file = tool({
    description: "Read a UTF-8 text file from the current project workspace by relative path.",
    inputSchema: z.object({
      path: z.string().describe("File path relative to project root, e.g. src/app/page.tsx"),
    }),
    execute: async ({ path: rawPath }) => {
      await ensureProjectAccess(userId, projectId);
      const path = safeProjectRelativePath(rawPath);
      const row = await prisma.projectFile.findUnique({
        where: { projectId_path: { projectId, path } },
        select: { content: true },
      });
      if (!row) {
        return { ok: false as const, path, error: "File not found" };
      }
      return {
        ok: true as const,
        path,
        content: row.content,
        length: row.content.length,
      };
    },
  });

  const write_file = tool({
    description:
      "Create or overwrite a UTF-8 text file in the project. Records a pending file change for the thread.",
    inputSchema: z.object({
      path: z.string(),
      content: z.string(),
    }),
    execute: async ({ path: rawPath, content }) => {
      await ensureProjectAccess(userId, projectId);
      const path = safeProjectRelativePath(rawPath);
      const prev = await prisma.projectFile.findUnique({
        where: { projectId_path: { projectId, path } },
        select: { content: true },
      });

      await prisma.$transaction([
        prisma.projectFile.upsert({
          where: { projectId_path: { projectId, path } },
          create: {
            projectId,
            path,
            content,
            size: Buffer.byteLength(content, "utf8"),
          },
          update: {
            content,
            size: Buffer.byteLength(content, "utf8"),
          },
        }),
        prisma.fileChange.create({
          data: {
            threadId,
            path,
            kind: prev ? "EDIT" : "ADD",
            oldContent: prev?.content ?? null,
            newContent: content,
            status: "PENDING",
          },
        }),
      ]);

      return {
        ok: true as const,
        path,
        bytes: Buffer.byteLength(content, "utf8"),
        kind: prev ? ("updated" as const) : ("created" as const),
      };
    },
  });

  const list_files = tool({
    description: "List project file paths, optionally filtered by prefix.",
    inputSchema: z.object({
      prefix: z.string().optional().describe("Only paths starting with this prefix (POSIX /)."),
    }),
    execute: async ({ prefix }) => {
      await ensureProjectAccess(userId, projectId);
      const rows = await prisma.projectFile.findMany({
        where: {
          projectId,
          ...(prefix
            ? {
                path: { startsWith: prefix.replace(/\\/g, "/").replace(/^\/+/, "") },
              }
            : {}),
        },
        select: { path: true, size: true },
        orderBy: { path: "asc" },
        take: 200,
      });
      return { paths: rows.map((r) => ({ path: r.path, size: r.size })) };
    },
  });

  const compute_diff = tool({
    description:
      "Compute a unified diff between the file currently in the project and proposed new content, or between two arbitrary strings.",
    inputSchema: z.object({
      path: z.string().describe("Project file to compare against."),
      proposedContent: z.string().describe("New content to diff against the stored file."),
    }),
    execute: async ({ path: rawPath, proposedContent }) => {
      await ensureProjectAccess(userId, projectId);
      const path = safeProjectRelativePath(rawPath);
      const row = await prisma.projectFile.findUnique({
        where: { projectId_path: { projectId, path } },
        select: { content: true },
      });
      const oldStr = row?.content ?? "";
      const patch = createTwoFilesPatch(path, path, oldStr, proposedContent, "", "", {
        context: 3,
      });
      const added = (patch.match(/^\+[^+]/gm) ?? []).length;
      const removed = (patch.match(/^-[^-]/gm) ?? []).length;
      return {
        path,
        unifiedDiff: patch,
        stats: { added, removed, charsOld: oldStr.length, charsNew: proposedContent.length },
      };
    },
  });

  const grep_files = tool({
    description: "Search for a substring across project files (simple contains, capped results).",
    inputSchema: z.object({
      query: z.string().min(1),
      maxResults: z.number().min(1).max(50).optional(),
    }),
    execute: async ({ query, maxResults = 20 }) => {
      await ensureProjectAccess(userId, projectId);
      const rows = await prisma.projectFile.findMany({
        where: { projectId, content: { contains: query } },
        select: { path: true, content: true },
        take: 80,
      });
      const out: { path: string; snippet: string }[] = [];
      for (const r of rows) {
        if (out.length >= maxResults) break;
        const idx = r.content.indexOf(query);
        if (idx === -1) continue;
        const start = Math.max(0, idx - 40);
        const snippet = r.content.slice(start, start + 120).replace(/\n/g, " ");
        out.push({ path: r.path, snippet });
      }
      return { matches: out, truncated: rows.length >= 80 };
    },
  });

  return {
    read_file,
    write_file,
    list_files,
    compute_diff,
    grep_files,
  };
}
