import type { ReactNode } from "react";

const CODE_RE = /`([^`]+)`/g;

export function renderInlineWithCode(text: string) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(CODE_RE)) {
    const m = match as RegExpMatchArray & { index?: number };
    const start = m.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <code
        key={`${start}-code`}
        className="rounded bg-muted px-1 py-0.5 font-mono text-[12px] text-foreground"
      >
        {m[1]}
      </code>
    );
    last = start + m[0]!.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
