"use client";

import { useCallback, useState } from "react";

import { submitComposerDraft } from "../actions/compose-placeholder";

export function useComposerDraft() {
  const [draft, setDraft] = useState("");
  const send = useCallback(() => {
    submitComposerDraft(draft);
    setDraft("");
  }, [draft]);
  return { draft, setDraft, send };
}
