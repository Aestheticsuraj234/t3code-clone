"use client";

import { useCallback, useRef, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import type { PanelImperativeHandle } from "react-resizable-panels";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AgentChatPanel } from "@/features/agent-chat/components/agent-chat-panel";
import { ProjectSidebar } from "@/features/project-sidebar/components/project-sidebar";

import { useWorkbench } from "../hooks/use-workbench";
import { MAIN_IDE_LAYOUT } from "../libs/default-layout";
import { RightPane } from "./right-pane";

export type WorkspaceIdeProps = {
  projectId?: string;
  threadId?: string;
};

export function WorkspaceIde(props: WorkspaceIdeProps = {}) {
  const { projectId, threadId } = props;
  const {
    sections,
    activeId,
    onSidebarPick,
    thread,
    branchLabel,
    contextPercent,
    messagesLoading,
    statusIndicator,
    onSend,
    sendPending,
    onNewAgent,
    newAgentPending,
    onCreateWorkspace,
    createWorkspacePending,
    emptyProjects,
    sidebarLoading,
  } = useWorkbench({ projectId: projectId ?? null, threadId: threadId ?? null });
  const sidebarRef = useRef<PanelImperativeHandle | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const closeSidebar = useCallback(() => {
    sidebarRef.current?.collapse();
    setCollapsed(true);
  }, []);
  const openSidebar = useCallback(() => {
    sidebarRef.current?.expand();
    setCollapsed(false);
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <ResizablePanelGroup
        id="ide-main"
        orientation="horizontal"
        className="flex h-full min-h-0 flex-1 rounded-none"
        defaultLayout={MAIN_IDE_LAYOUT}
      >
        <ResizablePanel
          id="sidebar"
          panelRef={sidebarRef}
          defaultSize="20%"
          minSize="16%"
          maxSize="34%"
          collapsible
          collapsedSize="0%"
          className="min-w-0"
        >
          <ProjectSidebar
            sections={sections}
            activeId={activeId}
            onSelect={onSidebarPick}
            onClose={closeSidebar}
            onNewAgent={onNewAgent}
            newAgentPending={newAgentPending}
            emptyProjects={emptyProjects}
            onCreateWorkspace={onCreateWorkspace}
            createWorkspacePending={createWorkspacePending}
            loading={sidebarLoading}
          />
        </ResizablePanel>
        <ResizableHandle className="w-px bg-border" />
        <ResizablePanel id="chat" defaultSize="42%" minSize="26%" className="min-w-0">
          <AgentChatPanel
            thread={thread}
            branchLabel={branchLabel}
            contextPercent={contextPercent}
            status={statusIndicator}
            messagesLoading={messagesLoading}
            onSend={onSend}
            sendPending={sendPending}
          />
        </ResizablePanel>
        <ResizableHandle className="w-px bg-border" />
        <ResizablePanel id="code" defaultSize="38%" minSize="28%" className="min-w-0">
          <RightPane />
        </ResizablePanel>
      </ResizablePanelGroup>

      {collapsed ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={openSidebar}
          className="absolute top-2 left-2 z-10 size-8 rounded-md bg-sidebar/90 text-muted-foreground shadow-sm hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Show sidebar"
        >
          <PanelLeftOpen className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
