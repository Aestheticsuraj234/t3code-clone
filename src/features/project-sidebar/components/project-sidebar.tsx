"use client";

import { PanelLeftClose, Plus, Search, Store } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { threadStatusDotClass } from "@/features/workspace/libs/thread-status-ui";

import type { ProjectSidebarSection } from "../libs/sidebar-types";
import { SidebarUserFooter } from "./sidebar-user-footer";

type ProjectSidebarProps = {
  sections: ProjectSidebarSection[];
  activeId: string;
  onSelect: (rowKey: string) => void;
  onClose?: () => void;
  onNewAgent?: () => void;
  newAgentPending?: boolean;
  emptyProjects?: boolean;
  onCreateWorkspace?: () => void;
  createWorkspacePending?: boolean;
  loading?: boolean;
};

export function ProjectSidebar({
  sections,
  activeId,
  onSelect,
  onClose,
  onNewAgent,
  newAgentPending,
  emptyProjects,
  onCreateWorkspace,
  createWorkspacePending,
  loading,
}: ProjectSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-1 px-2 pt-2 pb-1.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search chats"
            className="h-8 border-transparent bg-sidebar-accent/60 pl-7 text-xs placeholder:text-muted-foreground focus-visible:bg-sidebar-accent focus-visible:ring-0"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Hide sidebar"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      <div className="space-y-0.5 px-2 pb-2">
        <button
          type="button"
          onClick={onNewAgent}
          disabled={newAgentPending || !!loading}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="size-4 text-muted-foreground" />
          <span className="flex-1">New Agent</span>
          <Kbd className="ml-auto bg-sidebar-accent/70 font-mono text-[10px]">Ctrl+N</Kbd>
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Store className="size-4 text-muted-foreground" />
          <span>Marketplace</span>
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1 border-t border-sidebar-border">
        <div className="space-y-4 px-2 py-3">
          {loading ? (
            <div className="space-y-2 px-2">
              <div className="h-3 w-2/3 rounded bg-sidebar-accent/50" />
              <div className="h-3 w-full rounded bg-sidebar-accent/40" />
              <div className="h-3 w-5/6 rounded bg-sidebar-accent/40" />
            </div>
          ) : null}

          {emptyProjects ? (
            <div className="rounded-md border border-sidebar-border bg-sidebar-accent/30 px-3 py-4 text-center text-xs text-muted-foreground">
              <p className="mb-3">No workspace yet.</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={onCreateWorkspace}
                disabled={createWorkspacePending}
              >
                {createWorkspacePending ? "Creating…" : "Create workspace"}
              </Button>
            </div>
          ) : null}

          {sections.map((section) => (
            <div key={section.projectId}>
              <p className="px-2 pb-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                {section.heading}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const selected = item.rowKey === activeId;
                  return (
                    <li key={item.rowKey}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.rowKey)}
                        className={
                          selected
                            ? "flex w-full min-w-0 items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1.5 text-left text-sm text-sidebar-accent-foreground"
                            : "flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }
                      >
                        <span
                          className={threadStatusDotClass(item.indicator.tone)}
                          title={item.indicator.label}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {item.indicator.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>

      <SidebarUserFooter />
    </div>
  );
}
