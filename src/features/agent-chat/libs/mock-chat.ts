export type ChatContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullets"; items: string[] };

export type AgentThread = {
  id: string;
  title: string;
  blocks: ChatContentBlock[];
};

export const MOCK_AGENT_THREAD: AgentThread = {
  id: "thread-prisma",
  title: "Prisma plugin functionality",
  blocks: [
    {
      type: "paragraph",
      text:
        "Keep the home shell spacious: symmetric px-4 py-10 on outer wrappers so the three panes have breathing room.",
    },
    {
      type: "heading",
      text: "Alignment",
    },
    {
      type: "bullets",
      items: [
        "Center the chat column content with flex w-full max-w-md items-center mx-auto for narrow reading width.",
        "Sidebar rows use text-sm and rounded-md; active row uses bg-zinc-800/80.",
      ],
    },
    {
      type: "heading",
      text: "Card interior",
    },
    {
      type: "paragraph",
      text:
        "Use muted borders (border-zinc-800) and monospace for inline Tailwind snippets inside prose blocks.",
    },
  ],
};
