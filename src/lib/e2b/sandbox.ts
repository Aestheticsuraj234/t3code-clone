import { Sandbox } from "e2b";

import { getE2BApiKey, getE2BSandboxTimeoutMs, getE2BTemplate } from "./config";

export type ThreadSandboxMetadata = {
  projectId: string;
  threadId: string;
  userId: string;
};

function apiKeyOpts() {
  const apiKey = getE2BApiKey();
  if (!apiKey) {
    throw new Error("E2B_API_KEY is not set");
  }
  return { apiKey };
}

/**
 * Create a new Linux sandbox for a workspace thread (default `base` template, or `E2B_TEMPLATE`).
 */
export async function createSandboxForThread(meta: ThreadSandboxMetadata) {
  const opts = apiKeyOpts();
  return Sandbox.create({
    ...opts,
    template: getE2BTemplate(),
    timeoutMs: getE2BSandboxTimeoutMs(),
    metadata: {
      app: "t3code-clone",
      projectId: meta.projectId,
      threadId: meta.threadId,
      userId: meta.userId,
    },
  });
}

export async function connectSandbox(sandboxId: string) {
  return Sandbox.connect(sandboxId, {
    ...apiKeyOpts(),
    timeoutMs: getE2BSandboxTimeoutMs(),
  });
}

export async function killSandbox(sandboxId: string): Promise<boolean> {
  return Sandbox.kill(sandboxId, apiKeyOpts());
}
