"use client";

import { useState } from "react";

import { MOCK_AGENT_THREAD } from "@/features/agent-chat/libs/mock-chat";
import { useProjectSidebar } from "@/features/project-sidebar/hooks/use-project-sidebar";

export function useWorkbench() {
  const { sections, activeId, setActiveId, sidebarRowKey } = useProjectSidebar();
  const [chatTitle, setChatTitle] = useState(MOCK_AGENT_THREAD.title);

  const onSidebarPick = (id: string, label: string) => {
    setActiveId(id);
    setChatTitle(label);
  };

  const thread = { ...MOCK_AGENT_THREAD, title: chatTitle };

  return { sections, activeId, sidebarRowKey, onSidebarPick, thread };
}
