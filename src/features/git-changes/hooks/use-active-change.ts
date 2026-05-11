"use client";

import { useMemo, useState } from "react";

import { MOCK_CHANGES, type ChangedFile } from "../libs/mock-changes";

export function useActiveChange() {
  const [activePath, setActivePath] = useState<string>(MOCK_CHANGES[0]?.path ?? "");
  const activeFile = useMemo<ChangedFile | undefined>(
    () => MOCK_CHANGES.find((f) => f.path === activePath),
    [activePath]
  );
  return { changes: MOCK_CHANGES, activePath, setActivePath, activeFile };
}
