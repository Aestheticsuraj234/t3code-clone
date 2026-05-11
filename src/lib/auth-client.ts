import { createAuthClient } from "better-auth/react";

/**
 * Browser client for `/api/auth`.
 * Set `NEXT_PUBLIC_AUTH_URL` to your public site origin (same as `BETTER_AUTH_URL`).
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
});

/** Use in client components: `const { data, isPending } = useSession()` */
export const useSession = authClient.useSession;

export const signOut = authClient.signOut;
