"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import {
  ArrowDown,
  FolderCode,
  Loader2,
  Mic,
  MoreHorizontal,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { workspaceKeys } from "@/features/workspace/libs/query-keys";
import { dbMessagesToUiMessages, type StoredMessageRow } from "../libs/db-messages-to-ui";
import type { ThreadStatusIndicator } from "@/features/workspace/libs/thread-status-ui";

import { ChatMessageList } from "./chat-message-list";

type AgentChatPanelProps = {
  projectId: string | null;
  threadId: string | null;
  chatTitle: string;
  rawMessages: StoredMessageRow[];
  messagesLoading: boolean;
  branchLabel: string;
  contextPercent: number;
  status: ThreadStatusIndicator | null;
};

function statusBadgeVariant(tone: ThreadStatusIndicator["tone"]) {
  if (tone === "danger") return "destructive" as const;
  if (tone === "success") return "secondary" as const;
  return "outline" as const;
}

type SessionProps = {
  projectId: string;
  threadId: string;
  rawMessages: StoredMessageRow[];
  chatTitle: string;
  branchLabel: string;
  contextPercent: number;
  status: ThreadStatusIndicator | null;
};

function AgentChatSession({
  projectId,
  threadId,
  rawMessages,
  chatTitle,
  branchLabel,
  contextPercent,
  status,
}: SessionProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [stickBottom, setStickBottom] = useState(true);
  const qc = useQueryClient();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/projects/${projectId}/threads/${threadId}/chat`,
        credentials: "include",
      }),
    [projectId, threadId],
  );

  const initialMessages = useMemo(() => dbMessagesToUiMessages(rawMessages), [rawMessages]);

  const chat = useChat({
    id: `${projectId}:${threadId}`,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void qc.invalidateQueries({ queryKey: workspaceKeys.threadChanges(projectId, threadId) });
      void qc.invalidateQueries({ queryKey: workspaceKeys.projectFiles(projectId) });
    },
  });

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
    setStickBottom(true);
  }, []);

  useEffect(() => {
    if (!stickBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [chat.messages, stickBottom]);

  const onScrollAreaScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickBottom(dist < 120);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || chat.status !== "ready") return;
    void chat.sendMessage({ text });
    setDraft("");
    setStickBottom(true);
  }, [draft, chat]);

  const disableInput = chat.status !== "ready";
  const showJump = !stickBottom && chat.messages.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex min-h-11 shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <FolderCode className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium text-sm">{chatTitle}</span>
        {status ? (
          <Badge variant={statusBadgeVariant(status.tone)} className="shrink-0 text-[10px]">
            {status.label}
          </Badge>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Thread menu"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => toast.info("Chat options — coming soon")}>
              Rename thread
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToBottom()}>Jump to latest</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={onScrollAreaScroll}
          className="h-full overflow-y-auto overflow-x-hidden"
        >
          <div className="mx-auto max-w-2xl px-4 py-8">
            {chat.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages yet. Ask the agent to read or edit files in this project.
              </p>
            ) : (
              <>
                <ChatMessageList messages={chat.messages} />
                <div ref={bottomRef} className="h-px w-full shrink-0" aria-hidden />
              </>
            )}
          </div>
        </div>
        {showJump ? (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="pointer-events-auto size-9 rounded-full border border-border bg-background/90 shadow-lg"
              onClick={() => scrollToBottom()}
              aria-label="Scroll to latest message"
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border bg-background px-3 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-muted/30 px-2 py-1.5 shadow-sm">
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
            placeholder="Send a message"
            disabled={disableInput}
            className="h-9 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden h-8 gap-1.5 rounded-full border border-border bg-muted/60 px-3 text-xs sm:inline-flex"
          >
            <Sparkles className="size-3.5 text-violet-300" />
            OpenRouter
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
        <div className="mx-auto mt-2 flex max-w-2xl items-center gap-2 text-[11px] text-muted-foreground">
          <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono">
            {branchLabel}
          </span>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <span>{contextPercent}% context</span>
          {chat.status === "streaming" || chat.status === "submitted" ? (
            <>
              <Separator orientation="vertical" className="h-3 bg-border" />
              <span className="text-violet-300">Generating…</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AgentChatPanel({
  projectId,
  threadId,
  chatTitle,
  rawMessages,
  messagesLoading,
  branchLabel,
  contextPercent,
  status,
}: AgentChatPanelProps) {
  const ready = !!projectId && !!threadId;

  if (!ready) {
    return (
      <div className="flex h-full flex-col bg-background text-foreground">
        <div className="flex min-h-10 items-center border-b border-border px-4 py-2">
          <FolderCode className="mr-2 size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Select a thread</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Open or create a workspace thread from the sidebar to use the agent.
        </div>
      </div>
    );
  }

  if (messagesLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-background text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <span className="text-sm">Loading messages…</span>
      </div>
    );
  }

  return (
    <AgentChatSession
      key={`${projectId}:${threadId}`}
      projectId={projectId}
      threadId={threadId}
      rawMessages={rawMessages}
      chatTitle={chatTitle}
      branchLabel={branchLabel}
      contextPercent={contextPercent}
      status={status}
    />
  );
}
