"use client";

import { useRouter } from "next/navigation";

import { LogOutIcon } from "lucide-react";

import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

import { performSignOut } from "./sign-out-shared";

type Props = {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function LogoutButton({ variant = "outline", size = "sm" }: Props) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className="gap-1.5 font-medium"
      onClick={() => performSignOut(router)}
    >
      <LogOutIcon className="size-3.5 opacity-80" />
      Log out
    </Button>
  );
}
