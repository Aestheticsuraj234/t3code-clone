"use client";

import { useMemo, useState } from "react";

import { DEFAULT_OPEN_FILE } from "../libs/mock-files";

export function useActiveFile(initial = DEFAULT_OPEN_FILE) {
  const [path, setPath] = useState(initial);
  const tabTitle = useMemo(() => path.split("/").pop() ?? path, [path]);
  return { path, setPath, tabTitle };
}
