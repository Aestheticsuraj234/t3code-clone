"use client";

import { FolderCode, Mic, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useComposerDraft } from "../hooks/use-composer-draft";
import type { AgentThread } from "../libs/mock-chat";
import { ChatMessageBlocks } from "./chat-message-blocks";

type AgentChatPanelProps = {
  thread: AgentThread;
  branchLabel: string;
  contextPercent: number;
};

export function AgentChatPanel({ thread, branchLabel, contextPercent }: AgentChatPanelProps) {
  const { draft, setDraft, send } = useComposerDraft();

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <FolderCode className="size-4 text-muted-foreground" />
        <span className="truncate font-medium text-sm">{thread.title}</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-xl px-4 py-10">
          <div className="rounded-xl border border-border bg-card/60 p-5 shadow-sm">
            <ChatMessageBlocks thread={thread} />
          </div>
        </div>
      </ScrollArea>
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Add attachment"
          >
            <Plus className="size-4" />
          </Button>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Send follow-up"
            className="h-9 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden h-8 gap-1.5 rounded-full border border-border bg-muted/60 px-3 text-xs sm:inline-flex"
          >
            <Sparkles className="size-3.5 text-violet-300" />
            Composer 2 Fast
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Voice input"
          >
            <Mic className="size-4" />
          </Button>
        </div>
        <div className="mx-auto mt-2 flex w-full max-w-xl items-center gap-2 text-[11px] text-muted-foreground">
          <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono">
            {branchLabel}
          </span>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <span>{contextPercent}% context</span>
        </div>
      </div>
    </div>
  );
}
