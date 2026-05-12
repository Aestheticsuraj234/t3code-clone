import { createTwoFilesPatch } from "diff";

export type DiffLineKind = "ctx" | "add" | "del";

export type DiffLine = {
  kind: DiffLineKind;
  text: string;
};

/**
 * Turn a unified diff patch into line records for the changes panel.
 */
export function unifiedDiffToLines(path: string, oldStr: string, newStr: string): {
  lines: DiffLine[];
  added: number;
  removed: number;
} {
  const patch = createTwoFilesPatch(path, path, oldStr, newStr, "", "", { context: 3 });
  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;

  for (const line of patch.split("\n")) {
    if (
      line.startsWith("diff ") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ") ||
      line.startsWith("\\\\")
    ) {
      continue;
    }
    if (line.startsWith("@@")) continue;

    if (line.startsWith("+")) {
      lines.push({ kind: "add", text: line.slice(1) });
      added += 1;
    } else if (line.startsWith("-")) {
      lines.push({ kind: "del", text: line.slice(1) });
      removed += 1;
    } else if (line.startsWith(" ")) {
      lines.push({ kind: "ctx", text: line.slice(1) });
    } else if (line.length > 0) {
      lines.push({ kind: "ctx", text: line });
    }
  }

  return { lines, added, removed };
}
