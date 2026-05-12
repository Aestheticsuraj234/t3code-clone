import type { ThreadStatusIndicator } from "@/features/workspace/libs/thread-status-ui";

export type ProjectSidebarItem = {
  rowKey: string;
  threadId: string;
  projectId: string;
  title: string;
  indicator: ThreadStatusIndicator;
};

export type ProjectSidebarSection = {
  projectId: string;
  heading: string;
  items: ProjectSidebarItem[];
};
