import { toast } from "sonner";

import { signOut } from "@/lib/auth-client";

export async function performSignOut(nav: { push: (href: string) => void; refresh: () => void }) {
  await signOut({
    fetchOptions: {
      onSuccess: () => {
        toast.success("Signed out");
        nav.push("/login");
        nav.refresh();
      },
      onError: (ctx) => {
        toast.error(ctx.error?.message ?? "Could not sign out");
      },
    },
  });
}
