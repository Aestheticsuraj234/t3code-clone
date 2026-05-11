"use client";

import { useCallback, useState } from "react";

export function useTreeExpansion(initialOpen: string[] = []) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(initialOpen));
  const isOpen = useCallback((key: string) => open.has(key), [open]);
  const toggle = useCallback((key: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
  return { isOpen, toggle };
}
