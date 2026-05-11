/**
 * Paths that skip auth checks in `proxy.ts` (public routes).
 * Match with `pathname === base` or `pathname.startsWith(\`\${prefix}/\`) || pathname === prefix`.
 */
export const publicPathPrefixes = ["/login", "/api/auth"] as const;

export function isPublicPathname(pathname: string): boolean {
  return publicPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
