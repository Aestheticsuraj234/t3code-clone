import type { MessageRole } from "../../../../generated/browser";
import type { ChatContentBlock } from "./mock-chat";

type Row = { role: MessageRole; content: string };

export function messagesToChatBlocks(messages: Row[]): ChatContentBlock[] {
  if (!messages.length) {
    return [{ type: "paragraph", text: "No messages yet. Send a message to begin." }];
  }

  return messages.map((m) => {
    const prefix =
      m.role === "USER" || m.role === "ASSISTANT" ? "" : `[${m.role}] `;
    return { type: "paragraph", text: `${prefix}${m.content}` } satisfies ChatContentBlock;
  });
}
