import type { FsNode } from "../libs/mock-files";

/**
 * Build a single-root tree from flat project-relative file paths.
 */
export function pathsToFsTree(paths: string[]): FsNode {
  const root: FsNode = { kind: "dir", name: "workspace", children: [] };

  for (const filePath of paths) {
    const segments = filePath.split("/").filter(Boolean);
    if (segments.length === 0) continue;

    let node = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!;
      const isLast = i === segments.length - 1;
      if (node.kind !== "dir") break;

      if (isLast) {
        node.children.push({ kind: "file", name: seg, path: filePath });
        break;
      }

      let next = node.children.find(
        (c): c is Extract<FsNode, { kind: "dir" }> => c.kind === "dir" && c.name === seg,
      );
      if (!next) {
        next = { kind: "dir", name: seg, children: [] };
        node.children.push(next);
      }
      node = next;
    }
  }

  sortFs(root);
  return root;
}

function sortFs(node: FsNode) {
  if (node.kind !== "dir") return;
  node.children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const c of node.children) sortFs(c);
}
