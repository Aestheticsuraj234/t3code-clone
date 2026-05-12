"use client";

import { isToolUIPart, type UIMessage } from "ai";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  ChainOfThought,
  ChainOfThoughtContent,
} from "@/components/ai-elements/chain-of-thought";
import {
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { ShikiCodeBlock } from "./shiki-code-block";
import { UnifiedDiffView } from "./unified-diff-view";

type ToolPart = UIMessage["parts"][number];

function pickToolName(part: ToolPart): string {
  if (isToolUIPart(part) && part.type === "dynamic-tool") {
    return part.toolName;
  }
  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    return part.type.slice("tool-".length);
  }
  if (typeof part.type === "string") {
    return part.type;
  }
  return "tool";
}

function toolStatusLabel(part: ToolPart): string {
  const state = "state" in part ? part.state : "unknown";
  if (state === "output-available") return "Done";
  if (state === "input-streaming" || state === "input-available") return "Running…";
  return String(state);
}

export function ChatToolPart({ part }: { part: ToolPart }) {
  const name = pickToolName(part);
  const summary = toolStatusLabel(part);

  const outputAvailable = isToolUIPart(part) && part.state === "output-available";
  const showDiffBlock =
    name === "compute_diff" &&
    outputAvailable &&
    typeof part.output === "object" &&
    part.output !== null &&
    "unifiedDiff" in part.output &&
    typeof (part.output as { unifiedDiff: unknown }).unifiedDiff === "string";

  const inputJson =
    "input" in part && part.input !== undefined ? JSON.stringify(part.input, null, 2) : null;
  const outputJson =
    outputAvailable && part.output !== undefined ? JSON.stringify(part.output, null, 2) : null;

  return (
    <ChainOfThought defaultOpen className="border-border/80 bg-muted/10">
      <CollapsibleTrigger
        className={cn(
          "group flex w-full items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground group-data-panel-open:hidden" />
          <ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground group-data-panel-open:block" />
          <code className="truncate font-mono text-[12px] text-foreground">{name}</code>
        </span>
        <span className="shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground">
          {summary}
        </span>
      </CollapsibleTrigger>
      <ChainOfThoughtContent className="space-y-3 px-3 py-3">
        {inputJson ? (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Input</p>
            <ShikiCodeBlock code={inputJson} lang="json" />
          </div>
        ) : null}
        {outputAvailable ? (
          <div className="space-y-3">
            {showDiffBlock ? (
              <div className="space-y-2">
                <p className="text-[10px] font-medium tracking-wider text-amber-200/90 uppercase">
                  Unified diff
                </p>
                <UnifiedDiffView diff={(part.output as { unifiedDiff: string }).unifiedDiff} />
              </div>
            ) : null}
            {outputJson ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  {showDiffBlock ? "Output (JSON)" : "Output"}
                </p>
                <ShikiCodeBlock code={outputJson} lang="json" />
              </div>
            ) : null}
          </div>
        ) : null}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
