import { NextResponse } from "next/server";
import {
  convertToModelMessages,
  isTextUIPart,
  isToolUIPart,
  stepCountIs,
  streamText,
  type UIMessage,
  validateUIMessages,
} from "ai";

import { WORKSPACE_AGENT_SYSTEM } from "@/lib/agent/system-prompt";
import { createProjectAgentTools } from "@/lib/agent/project-tools";
import { getOpenRouterModel } from "@/lib/ai/openrouter";
import { getUserId } from "@/lib/session";
import * as workspace from "@/features/workspace/libs/workspace-service";
import { inngest } from "@/inngest/client";

export const maxDuration = 120;

type Ctx = { params: Promise<{ projectId: string; threadId: string }> };

function assistantPayload(msg: UIMessage) {
  const text = msg.parts.filter(isTextUIPart).map((p) => p.text).join("");
  const toolRecords: Array<{ name: string; input: unknown; output: unknown }> = [];
  for (const part of msg.parts) {
    if (!isToolUIPart(part)) continue;
    if (part.state !== "output-available") continue;
    const name =
      part.type === "dynamic-tool"
        ? part.toolName
        : part.type.startsWith("tool-")
          ? part.type.slice("tool-".length)
          : part.type;
    toolRecords.push({
      name,
      input: part.input,
      output: part.output,
    });
  }
  return { text, toolRecords };
}

export async function POST(req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing OPENROUTER_API_KEY. Add it to your environment." },
      { status: 503 },
    );
  }

  const { projectId, threadId } = await ctx.params;
  const body = (await req.json()) as { messages?: unknown };

  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Expected { messages: UIMessage[] }" }, { status: 400 });
  }

  const tools = createProjectAgentTools({ userId, projectId, threadId });

  let messages: UIMessage[];
  try {
    messages = await validateUIMessages({
      messages: body.messages as UIMessage[],
      tools: tools as Parameters<typeof validateUIMessages>[0]["tools"],
    });
  } catch {
    return NextResponse.json({ error: "Invalid messages or tool parts" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    const userText = lastUser.parts.filter(isTextUIPart).map((p) => p.text).join("");
    if (userText.length > 0) {
      await workspace.createUserMessageWithId(userId, projectId, threadId, lastUser.id, userText);
    }
  }

  const modelMessages = await convertToModelMessages(messages, { tools });

  const result = streamText({
    model: getOpenRouterModel(),
    system: WORKSPACE_AGENT_SYSTEM,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(25),
    onError: ({ error }) => {
      void workspace.setThreadStatus(userId, projectId, threadId, "ERROR", String(error));
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ responseMessage, isAborted }) => {
      if (isAborted) {
        await workspace.setThreadStatus(userId, projectId, threadId, "CANCELLED", null);
        return;
      }

      const { text, toolRecords } = assistantPayload(responseMessage);

      try {
        await workspace.saveAssistantAfterAgentRun(
          userId,
          projectId,
          threadId,
          text,
          toolRecords,
          responseMessage.id,
        );
      } catch (e) {
        await workspace.setThreadStatus(userId, projectId, threadId, "ERROR", String(e));
      }

      try {
        await inngest.send({
          name: "agent/chat.completed",
          data: { projectId, threadId, userId },
        });
      } catch {
        /* inngest optional in dev */
      }
    },
  });
}
