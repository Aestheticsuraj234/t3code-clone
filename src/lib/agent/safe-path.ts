/** Normalize and validate a path relative to project root ( POSIX-style, no `..`). */
export function safeProjectRelativePath(raw: string): string {
  const p = raw.replace(/\\/g, "/").replace(/^\/+/, "").trim();
  if (!p || p.includes("..")) {
    throw new Error("Invalid path: use a project-relative path without '..'");
  }
  return p;
}
