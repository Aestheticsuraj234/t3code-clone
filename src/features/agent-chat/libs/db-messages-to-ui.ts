import type { UIMessage } from "ai";

import type { MessageRole } from "../../../../generated/browser";

export type StoredToolCallRow = {
  id: string;
  name: string;
  input: unknown;
  output: unknown | null;
  status: string;
};

export type StoredMessageRow = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string | Date;
  toolCalls?: StoredToolCallRow[];
};

function roleToUi(role: MessageRole): UIMessage["role"] {
  if (role === "USER") return "user";
  if (role === "ASSISTANT") return "assistant";
  return "system";
}

/**
 * Maps persisted Prisma messages to AI SDK UI messages for useChat hydration.
 */
export function dbMessagesToUiMessages(rows: StoredMessageRow[]): UIMessage[] {
  return rows.map((row) => {
    const role = roleToUi(row.role);
    const parts: UIMessage["parts"] = [];

    if (row.content.trim().length > 0) {
      parts.push({
        type: "text",
        text: row.content,
        state: "done",
      });
    }

    if (row.role === "ASSISTANT" && row.toolCalls?.length) {
      for (const tc of row.toolCalls) {
        const t = `tool-${tc.name}` as const;
        parts.push({
          type: t,
          toolCallId: tc.id,
          state: "output-available",
          input: tc.input,
          output: tc.output ?? undefined,
        });
      }
    }

    if (parts.length === 0) {
      parts.push({ type: "text", text: "", state: "done" });
    }

    return {
      id: row.id,
      role,
      parts,
    } as UIMessage;
  });
}
