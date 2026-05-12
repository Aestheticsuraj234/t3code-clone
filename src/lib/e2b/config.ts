/**
 * E2B reads `E2B_API_KEY` by default; we centralize env so server routes validate early.
 * @see https://e2b.dev/docs
 */
export function getE2BApiKey(): string | undefined {
  const key = process.env.E2B_API_KEY?.trim();
  return key || undefined;
}

export function isE2BConfigured(): boolean {
  return !!getE2BApiKey();
}

export function getE2BTemplate(): string {
  return process.env.E2B_TEMPLATE?.trim() || "base";
}

/** Default sandbox lifetime (ms). E2B default is 300_000 (5m); we use 30m unless overridden. */
export function getE2BSandboxTimeoutMs(): number {
  const raw = process.env.E2B_SANDBOX_TIMEOUT_MS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 30 * 60 * 1000;
}
