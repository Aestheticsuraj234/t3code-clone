export type DiffLine = {
  kind: "ctx" | "add" | "del";
  text: string;
};

export type ChangedFile = {
  path: string;
  added: number;
  removed: number;
  diff: DiffLine[];
};

export const MOCK_BRANCH = "master";
export const MOCK_BRANCH_REMOTE = "Local";

export const MOCK_CHANGES: ChangedFile[] = [
  {
    path: "src/app/(app)/layout.tsx",
    added: 2,
    removed: 5,
    diff: [
      { kind: "del", text: 'import { SiteHeader } from "@/components/layout/site-header";' },
      { kind: "del", text: "" },
      { kind: "ctx", text: "export default function AppLayout({ children }: { children: React.ReactNode }) {" },
      { kind: "ctx", text: "  return (" },
      { kind: "del", text: '    <div className="flex min-h-svh flex-col">' },
      { kind: "del", text: "      <SiteHeader />" },
      { kind: "del", text: '      <div className="flex flex-1 flex-col">{children}</div>' },
      { kind: "add", text: '    <div className="dark flex min-h-svh flex-col bg-background text-foreground">' },
      { kind: "add", text: '      <div className="flex min-h-0 flex-1 flex-col">{children}</div>' },
      { kind: "ctx", text: "    </div>" },
      { kind: "ctx", text: "  );" },
      { kind: "ctx", text: "}" },
    ],
  },
  {
    path: "src/app/(app)/page.tsx",
    added: 3,
    removed: 33,
    diff: [
      { kind: "del", text: 'import Image from "next/image";' },
      { kind: "del", text: 'import Link from "next/link";' },
      { kind: "add", text: 'import { WorkspaceIde } from "@/features/workspace-shell/components/workspace-ide";' },
      { kind: "ctx", text: "" },
      { kind: "ctx", text: "export default function Home() {" },
      { kind: "ctx", text: "  return (" },
      { kind: "add", text: '    <div className="flex min-h-0 flex-1 flex-col">' },
      { kind: "add", text: "      <WorkspaceIde />" },
      { kind: "ctx", text: "    </div>" },
      { kind: "ctx", text: "  );" },
      { kind: "ctx", text: "}" },
    ],
  },
  {
    path: "src/features/agent-chat/components/agent-chat-panel.tsx",
    added: 80,
    removed: 0,
    diff: [],
  },
  {
    path: "src/features/project-sidebar/components/project-sidebar.tsx",
    added: 102,
    removed: 0,
    diff: [],
  },
  {
    path: "src/features/workspace-shell/components/workspace-ide.tsx",
    added: 88,
    removed: 0,
    diff: [],
  },
];

export const MOCK_TOTAL_ADDED = 768;
export const MOCK_TOTAL_REMOVED = 41;
export const MOCK_TOTAL_CHANGES = 32;
