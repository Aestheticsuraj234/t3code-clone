"use client";

import { Files, GitBranch, SquareTerminal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeWorkspace } from "@/features/code-workspace/components/code-workspace";
import { GitChangesPanel } from "@/features/git-changes/components/git-changes-panel";

import { WorkspaceTerminal } from "./workspace-terminal";

const PANELS = ["changes", "files", "terminal"] as const;
type Panel = (typeof PANELS)[number];

function isPanel(v: string): v is Panel {
  return (PANELS as readonly string[]).includes(v);
}

type RightPaneProps = {
  projectId: string | null;
  threadId: string | null;
};

export function RightPane({ projectId, threadId }: RightPaneProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const panel: Panel = useMemo(() => {
    const p = searchParams.get("panel");
    return p && isPanel(p) ? p : "changes";
  }, [searchParams]);

  const onTabChange = useCallback(
    (value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (isPanel(value)) {
        p.set("panel", value);
      }
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <Tabs value={panel} onValueChange={onTabChange} className="flex h-full min-h-0 flex-col gap-0 bg-background">
      <TabsList
        variant="line"
        className="h-9 w-full justify-start gap-1 rounded-none border-b border-border bg-background px-2"
      >
        <TabsTrigger value="changes" className="h-7 px-2 text-xs">
          <GitBranch className="size-3.5" />
          Changes
        </TabsTrigger>
        <TabsTrigger value="files" className="h-7 px-2 text-xs">
          <Files className="size-3.5" />
          Files
        </TabsTrigger>
        <TabsTrigger value="terminal" className="h-7 px-2 text-xs">
          <SquareTerminal className="size-3.5" />
          Terminal
        </TabsTrigger>
      </TabsList>
      <TabsContent value="changes" className="min-h-0 flex-1 outline-none">
        <GitChangesPanel projectId={projectId} threadId={threadId} />
      </TabsContent>
      <TabsContent value="files" className="min-h-0 flex-1 outline-none">
        <CodeWorkspace projectId={projectId} threadId={threadId} />
      </TabsContent>
      <TabsContent value="terminal" className="min-h-0 flex-1 outline-none">
        <WorkspaceTerminal projectId={projectId} threadId={threadId} />
      </TabsContent>
    </Tabs>
  );
}
