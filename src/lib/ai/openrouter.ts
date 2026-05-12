import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:3000",
    "X-OpenRouter-Title": process.env.OPENROUTER_APP_NAME ?? "t3code-clone",
  },
});

export function getOpenRouterModel() {
  const id = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  return openrouter.chat(id);
}

/** Faster / cheaper model for editor inline suggestions (Tab to accept). */
export function getOpenRouterInlineModel() {
  const id = process.env.OPENROUTER_INLINE_MODEL ?? "openai/gpt-4o-mini";
  return openrouter.chat(id);
}
