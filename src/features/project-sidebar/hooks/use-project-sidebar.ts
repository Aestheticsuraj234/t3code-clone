"use client";

import { useMemo, useState } from "react";

import { MOCK_SIDEBAR_SECTIONS } from "../libs/mock-projects";
import { sidebarRowKey } from "../utils/sidebar-keys";

export function useProjectSidebar() {
  const defaultId = useMemo(
    () =>
      sidebarRowKey(MOCK_SIDEBAR_SECTIONS[0]!.heading, MOCK_SIDEBAR_SECTIONS[0]!.items[0]!),
    []
  );
  const [activeId, setActiveId] = useState(defaultId);
  return { sections: MOCK_SIDEBAR_SECTIONS, activeId, setActiveId, sidebarRowKey };
}
