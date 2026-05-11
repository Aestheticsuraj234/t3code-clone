"use client";

import type { AgentThread } from "../libs/mock-chat";
import { renderInlineWithCode } from "../utils/format-chat";

export function ChatMessageBlocks({ thread }: { thread: AgentThread }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground">
      {thread.blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`${block.type}-${index}`} className="font-medium text-base">
              {block.text}
            </h3>
          );
        }
        if (block.type === "bullets") {
          return (
            <ul
              key={`${block.type}-${index}`}
              className="list-disc space-y-1 pl-5 text-muted-foreground"
            >
              {block.items.map((item) => (
                <li key={item}>{renderInlineWithCode(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={`${block.type}-${index}`} className="text-muted-foreground">
            {renderInlineWithCode(block.text)}
          </p>
        );
      })}
    </div>
  );
}
