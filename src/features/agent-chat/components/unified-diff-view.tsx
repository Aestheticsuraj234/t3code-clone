"use client";

type UnifiedDiffViewProps = {
  diff: string;
};

export function UnifiedDiffView({ diff }: UnifiedDiffViewProps) {
  const lines = diff.split("\n");
  return (
    <pre className="max-h-96 overflow-auto rounded-md border border-border bg-zinc-950/90 p-3 font-mono text-[11px] leading-snug shadow-inner">
      {lines.map((line, i) => {
        let cls = "text-zinc-400";
        if (line.startsWith("+") && !line.startsWith("+++")) {
          cls = "text-emerald-400";
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          cls = "text-rose-400";
        } else if (line.startsWith("@@")) {
          cls = "text-amber-200";
        } else if (line.startsWith("diff ") || line.startsWith("--- ") || line.startsWith("+++ ")) {
          cls = "text-sky-300/90";
        }
        return (
          <div key={i} className={cls}>
            {line.length ? line : "\u00a0"}
          </div>
        );
      })}
    </pre>
  );
}
