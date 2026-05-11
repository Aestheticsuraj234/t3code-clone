import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with Google or GitHub",
};

function LoginFallback() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="size-6" />
      <p className="text-sm">Loading sign-in…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
