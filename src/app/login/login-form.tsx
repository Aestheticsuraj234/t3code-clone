"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GithubGlyphIcon, GoogleGlyphIcon } from "@/components/auth/oauth-brand-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

type OAuthProvider = "google" | "github";

function safeCallbackUrl(raw: string | null) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterSignIn = useMemo(
    () => safeCallbackUrl(searchParams.get("callbackUrl")),
    [searchParams],
  );
  const [pending, setPending] = useState<OAuthProvider | null>(null);

  async function signInWith(provider: OAuthProvider) {
    setPending(provider);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: afterSignIn,
      });

      if (error) {
        toast.error(error.message ?? "Something went wrong");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      toast.error(message);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="relative isolate flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_28%_18%,color-mix(in_oklab,var(--muted)_82%,transparent)_0%,transparent_52%),radial-gradient(circle_at_74%_64%,color-mix(in_oklab,var(--accent)_52%,transparent)_0%,transparent_54%),linear-gradient(155deg,var(--background)_0%,color-mix(in_oklab,var(--muted)_44%,var(--background))_88%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-center text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="rounded-lg bg-foreground px-2 py-1 font-semibold text-background text-xs uppercase tracking-[0.2em]">
            App
          </span>
          <span className="hidden sm:inline">← Back home</span>
        </Link>

        <Card className="w-full border-border/70 shadow-[0_24px_80px_-32px_color-mix(in_oklab,var(--foreground)_28%,transparent)] backdrop-blur-sm">
          <CardHeader className="space-y-3 px-6 pt-6 text-center sm:px-8">
            <CardTitle className="font-heading text-2xl tracking-tight">Welcome back</CardTitle>
            <CardDescription className="mx-auto max-w-sm text-[15px] leading-relaxed text-pretty">
              Continue with your preferred account. We sync your profile securely via OAuth.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid w-full gap-3 px-6 pt-2 pb-4 sm:px-8">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full justify-center gap-3 border-border/80 bg-background shadow-xs hover:bg-muted/70 dark:bg-background/80"
              disabled={pending !== null}
              onClick={() => signInWith("google")}
              data-icon="inline-start"
            >
              <GoogleGlyphIcon className="size-[18px] shrink-0" />
              {pending === "google" ? "Opening Google…" : "Continue with Google"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full justify-center gap-3 border-transparent bg-[#24292f] text-white shadow-xs hover:bg-[#24292f]/92 hover:text-white dark:bg-[#24292f]"
              disabled={pending !== null}
              onClick={() => signInWith("github")}
              data-icon="inline-start"
            >
              <GithubGlyphIcon className="size-[18px] shrink-0 opacity-95" />
              {pending === "github" ? "Opening GitHub…" : "Continue with GitHub"}
            </Button>
          </CardContent>
          <div className="space-y-4 px-6 pb-6 sm:px-8">
            <Separator />
            <p className="mx-auto max-w-xs text-center text-muted-foreground text-xs leading-relaxed text-pretty">
              By continuing you agree to OAuth provider terms and this app&apos;s privacy practices.
            </p>
          </div>
        </Card>

        <p className="w-full max-w-md text-center text-muted-foreground text-xs leading-relaxed text-pretty">
          Already signed in elsewhere?{" "}
          <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={() => router.refresh()}>
            Refresh session
          </button>
        </p>
      </div>
    </div>
  );
}
