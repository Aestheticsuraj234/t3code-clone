
export const publicPathPrefixes = ["/login", "/api/auth" , "/api/inngest"] as const;

export function isPublicPathname(pathname: string): boolean {
  return publicPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
