import { inngest } from "@/inngest/client";
import { processTask } from "@/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask],
});