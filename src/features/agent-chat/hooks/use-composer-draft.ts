"use client";

import { useCallback, useState } from "react";

type Options = {
  onSend?: (text: string) => void;
};

export function useComposerDraft({ onSend }: Options = {}) {
  const [draft, setDraft] = useState("");

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || !onSend) return;
    onSend(text);
    setDraft("");
  }, [draft, onSend]);

  return { draft, setDraft, send };
}
