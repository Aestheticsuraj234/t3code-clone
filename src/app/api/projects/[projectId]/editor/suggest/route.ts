import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";

import { getOpenRouterInlineModel } from "@/lib/ai/openrouter";
import { getUserId } from "@/lib/session";
import * as workspace from "@/features/workspace/libs/workspace-service";

export const maxDuration = 30;

const BodySchema = z.object({
  path: z.string().min(1).max(2048),
  code: z.string().max(100_000),
  cursor: z.number().int().min(0),
});

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 503 });
  }

  const { projectId } = await ctx.params;
  const project = await workspace.getProject(userId, projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { path: filePath, code, cursor } = body;
  const head = Math.min(cursor, code.length);
  const before = code.slice(0, head);
  const after = code.slice(head);

  const prompt = `You are an inline code completion engine. The user is editing "${filePath}".

Return ONLY the characters that should be inserted at the cursor — no quotes, no markdown fences, no commentary.
Keep it under 120 characters unless completing an obvious long string literal.
If nothing sensible should be suggested, return an empty string.

--- code before cursor ---
${before}
--- code after cursor ---
${after}
`;

  try {
    const { text } = await generateText({
      model: getOpenRouterInlineModel(),
      prompt,
      maxOutputTokens: 180,
    });
    const suggestion = text.trim().replace(/^["'`]+|["'`]+$/g, "");
    return NextResponse.json({ suggestion });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Suggestion failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
