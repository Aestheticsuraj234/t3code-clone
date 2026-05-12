import { z } from "zod";

export const createProjectBody = z.object({
  name: z.string().trim().min(1).max(120),
});

export const createThreadBody = z.object({
  title: z.string().trim().min(1).max(200),
});

export const createMessageBody = z.object({
  content: z.string().trim().min(1).max(12_000),
});
