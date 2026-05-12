import { FileType, type Sandbox } from "e2b";

/** Where agent files are mirrored in the E2B VM (absolute path). */
export function e2bWorkspaceRoot(): string {
  return (process.env.E2B_WORKSPACE_ROOT ?? "/home/user/workspace").replace(/\/$/, "");
}

const MAX_PULL_FILE_BYTES = 2_000_000;

/** Directory names (any depth) to skip when pulling from the sandbox. */
const SKIP_SEGMENTS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".cache",
  "__pycache__",
  ".turbo",
]);

function skipRelativePath(rel: string): boolean {
  const norm = rel.replace(/\\/g, "/").replace(/^\/+/, "");
  return norm.split("/").some((seg) => SKIP_SEGMENTS.has(seg));
}

/**
 * Writes project-relative paths into the sandbox (creates parent dirs per E2B semantics).
 */
export async function writeAllProjectFilesToSandbox(
  sandbox: Sandbox,
  files: Array<{ path: string; content: string }>,
): Promise<number> {
  const root = e2bWorkspaceRoot();
  const batch = files.map((f) => ({
    path: `${root}/${f.path.replace(/^\/+/, "")}`,
    data: f.content,
  }));
  if (!batch.length) return 0;
  await sandbox.files.write(batch);
  return batch.length;
}

/** Writes one project-relative file into the sandbox workspace root. */
export async function writeProjectFileToSandbox(
  sandbox: Sandbox,
  relativePath: string,
  content: string,
): Promise<void> {
  const root = e2bWorkspaceRoot();
  const abs = `${root}/${relativePath.replace(/^\/+/, "")}`;
  await sandbox.files.write(abs, content);
}

export type PullSandboxStats = {
  files: number;
  skippedLarge: number;
  skippedUnreadable: number;
  skippedDirs: number;
};

/**
 * Recursively read text files under the sandbox workspace root into project-relative paths.
 */
export async function readSandboxWorkspaceTree(
  sandbox: Sandbox,
): Promise<{ files: Array<{ path: string; content: string }>; stats: PullSandboxStats }> {
  const root = e2bWorkspaceRoot();
  const out: Array<{ path: string; content: string }> = [];
  const stats: PullSandboxStats = {
    files: 0,
    skippedLarge: 0,
    skippedUnreadable: 0,
    skippedDirs: 0,
  };

  async function walk(dirAbs: string): Promise<void> {
    let entries;
    try {
      entries = await sandbox.files.list(dirAbs);
    } catch {
      return;
    }

    for (const ent of entries) {
      const isDir = ent.type === FileType.DIR;
      if (isDir) {
        if (SKIP_SEGMENTS.has(ent.name)) {
          stats.skippedDirs += 1;
          continue;
        }
        await walk(ent.path);
        continue;
      }

      let rel = ent.path.startsWith(`${root}/`)
        ? ent.path.slice(root.length + 1)
        : ent.path.replace(/^\//, "");
      rel = rel.replace(/\\/g, "/");
      if (skipRelativePath(rel)) continue;
      if (ent.size > MAX_PULL_FILE_BYTES) {
        stats.skippedLarge += 1;
        continue;
      }
      try {
        const content = await sandbox.files.read(ent.path, { format: "text" });
        if (typeof content !== "string") continue;
        out.push({ path: rel, content });
        stats.files += 1;
      } catch {
        stats.skippedUnreadable += 1;
      }
    }
  }

  await walk(root);
  return { files: out, stats };
}
