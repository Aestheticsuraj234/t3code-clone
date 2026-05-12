import { inngest } from "./client";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      return { processed: true, id: event.data.id };
    });

    await step.sleep("pause", "1s");

    return { message: `Task ${event.data.id} complete`, result };
  }
);

/** Fires when the IDE agent finishes a chat turn (durable workflows can subscribe here). */
export const onAgentChatCompleted = inngest.createFunction(
  { id: "agent-chat-completed", triggers: { event: "agent/chat.completed" } },
  async ({ event }) => {
    return { acknowledged: true as const, projectId: event.data.projectId, threadId: event.data.threadId };
  }
);