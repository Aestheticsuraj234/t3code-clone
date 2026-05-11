import type { FsNode } from "../libs/mock-files";

export type TreeRow =
  | { kind: "folder"; key: string; name: string; depth: number; expanded: boolean }
  | { kind: "file"; key: string; path: string; name: string; depth: number };

export function walkFiles(
  node: FsNode,
  isOpen: (key: string) => boolean,
  depth = 0,
  parentKey = ""
): TreeRow[] {
  if (node.kind === "file") {
    return [{ kind: "file", key: node.path, path: node.path, name: node.name, depth }];
  }
  const folderKey = parentKey ? `${parentKey}/${node.name}` : node.name;
  const expanded = isOpen(folderKey);
  const rows: TreeRow[] = [
    { kind: "folder", key: folderKey, name: node.name, depth, expanded },
  ];
  if (expanded) {
    for (const child of node.children) {
      rows.push(...walkFiles(child, isOpen, depth + 1, folderKey));
    }
  }
  return rows;
}
