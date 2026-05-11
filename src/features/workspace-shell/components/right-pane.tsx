"use client";

import { Files, GitBranch } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeWorkspace } from "@/features/code-workspace/components/code-workspace";
import { GitChangesPanel } from "@/features/git-changes/components/git-changes-panel";

export function RightPane() {
  return (
    <Tabs
      defaultValue="changes"
      className="flex h-full min-h-0 flex-col gap-0 bg-background"
    >
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
      </TabsList>
      <TabsContent value="changes" className="min-h-0 flex-1 outline-none">
        <GitChangesPanel />
      </TabsContent>
      <TabsContent value="files" className="min-h-0 flex-1 outline-none">
        <CodeWorkspace />
      </TabsContent>
    </Tabs>
  );
}
