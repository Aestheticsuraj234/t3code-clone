"use client";

import { isTextUIPart, isToolUIPart, type UIMessage } from "ai";

import { renderInlineWithCode } from "../utils/format-chat";
import { ChatToolPart } from "./chat-tool-part";

export function ChatMessageList({ messages }: { messages: UIMessage[] }) {
  return (
    <div className="space-y-5">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={isUser ? "flex justify-end" : "flex justify-start"}
          >
            <article
              className={
                isUser
                  ? "max-w-[min(100%,32rem)] rounded-2xl border border-border/60 bg-muted/70 px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm"
                  : "max-w-[min(100%,40rem)] space-y-3 rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm backdrop-blur-[2px]"
              }
            >
              <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/30 pb-1.5">
                <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {isUser ? "You" : "Assistant"}
                </span>
              </div>
              <div className="space-y-3">
                {message.parts.map((part, index) => {
                  if (isTextUIPart(part)) {
                    const isStreaming = part.state === "streaming";
                    return (
                      <div
                        key={`text-${index}`}
                        className={
                          isUser
                            ? "text-foreground"
                            : "text-muted-foreground [word-break:break-word]"
                        }
                      >
                        <span className={isStreaming ? "animate-pulse" : undefined}>
                          {renderInlineWithCode(part.text)}
                        </span>
                      </div>
                    );
                  }

                  if (isToolUIPart(part)) {
                    return <ChatToolPart key={`${message.id}-tool-${index}`} part={part} />;
                  }

                  return null;
                })}
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
