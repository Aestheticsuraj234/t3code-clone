"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { SHIKI_THEME } from "@/features/code-workspace/libs/lang-map";

type Props = {
  code: string;
  lang: "json" | "typescript" | "javascript" | "tsx" | "text";
  className?: string;
};

export function ShikiCodeBlock({ code, lang, className }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const effectiveLang = lang === "text" ? "text" : lang;
        const out = await codeToHtml(code, {
          lang: effectiveLang,
          theme: SHIKI_THEME,
        });
        if (!cancelled) {
          setHtml(out);
          setFallback(null);
        }
      } catch {
        if (!cancelled) {
          setHtml(null);
          setFallback(code);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (html) {
    return (
      <div
        className={cn(
          "shiki-code-block overflow-x-auto rounded-md border border-border bg-muted/20 p-2 text-[11px] leading-relaxed [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0",
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <pre
      className={cn(
        "max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-2 font-mono text-[11px] text-muted-foreground",
        className
      )}
    >
      {fallback ?? code}
    </pre>
  );
}
