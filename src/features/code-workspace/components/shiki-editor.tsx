"use client";

import { ShikiEditor } from "@cmshiki/editor";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { SHIKI_FALLBACK_LANG, SHIKI_THEME } from "../libs/lang-map";

type Props = {
  doc: string;
  lang: string;
  className?: string;
};

export function ShikiCodeEditor({ doc, lang, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    let cancelled = false;
    let active: ShikiEditor | null = null;

    const create = (useLang: string) =>
      ShikiEditor.create({
        parent,
        doc,
        lang: useLang,
        theme: SHIKI_THEME,
        engine: "javascript",
      });

    setError(null);
    create(lang)
      .catch(() => create(SHIKI_FALLBACK_LANG))
      .then((editor) => {
        if (!editor) return;
        if (cancelled) {
          editor.destroy();
          return;
        }
        active = editor;
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not initialise editor");
        }
      });

    return () => {
      cancelled = true;
      active?.destroy();
      active = null;
    };
  }, [doc, lang]);

  return (
    <div className={cn("relative min-h-0", className)}>
      <div ref={containerRef} className="absolute inset-0 overflow-auto" />
      {error ? (
        <pre className="absolute inset-0 overflow-auto whitespace-pre-wrap p-4 font-mono text-[12px] text-muted-foreground">
          {doc}
          {"\n\n"}
          <span className="text-destructive">[editor: {error}]</span>
        </pre>
      ) : null}
    </div>
  );
}
