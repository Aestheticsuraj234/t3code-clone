"use client";

import { ShikiEditor } from "@cmshiki/editor";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { buildInlineSuggestionExtensions } from "../codemirror/inline-suggestion";
import { SHIKI_FALLBACK_LANG, SHIKI_THEME } from "../libs/lang-map";

export type ShikiCodeEditorProps = {
  doc: string;
  lang: string;
  className?: string;
  /**
   * Must match a key in the `themes` map for @cmshiki (not the Shiki bundle name like `vesper`).
   */
  colorMode: "light" | "dark";
  /** When set, enables debounced AI ghost text; Tab accepts, Esc clears. */
  inlineSuggest?: { projectId: string; path: string } | null;
  /** Fires when the editor buffer changes (typing). Used for dirty state / save; keep the prop reference stable. */
  onDocumentChange?: (text: string) => void;
};

export function ShikiCodeEditor({
  doc,
  lang,
  className,
  colorMode,
  inlineSuggest,
  onDocumentChange,
}: ShikiCodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onDocCb = useRef(onDocumentChange);
  onDocCb.current = onDocumentChange;

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    let cancelled = false;
    let active: ShikiEditor | null = null;

    const destroy = () => {
      active?.destroy();
      active = null;
      parent.replaceChildren();
    };

    const extraExtensions =
      inlineSuggest?.projectId && inlineSuggest.path
        ? buildInlineSuggestionExtensions({
            projectId: inlineSuggest.projectId,
            filePath: inlineSuggest.path,
          })
        : [];

    const createWithLang = (useLang: string) =>
      ShikiEditor.create({
        parent,
        doc,
        lang: useLang,
        themes: {
          dark: SHIKI_THEME,
          light: SHIKI_THEME,
        },
        defaultColor: colorMode,
        engine: "javascript",
        extensions: extraExtensions,
        onUpdate: (u) => {
          if (u.docChanged) {
            onDocCb.current?.(u.state.doc.toString());
          }
        },
      });

    setError(null);

    (async () => {
      try {
        let editor: ShikiEditor;
        try {
          editor = await createWithLang(lang);
        } catch {
          editor = await createWithLang(SHIKI_FALLBACK_LANG);
        }
        if (cancelled) {
          editor.destroy();
          return;
        }
        active = editor;
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not initialise editor");
        }
      }
    })();

    return () => {
      cancelled = true;
      destroy();
    };
  }, [doc, lang, colorMode, inlineSuggest?.projectId, inlineSuggest?.path]);

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
