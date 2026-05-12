"use client";

import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** Collapsible “reasoning step” surface (AI Elements–style), built on Base UI primitives. @see https://elements.ai-sdk.dev/components/chain-of-thought */

export type ChainOfThoughtProps = ComponentProps<typeof Collapsible>;

export const ChainOfThought = memo(function ChainOfThought({
  className,
  defaultOpen = true,
  ...props
}: ChainOfThoughtProps) {
  return (
    <Collapsible
      data-slot="chain-of-thought"
      className={cn(
        "overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-sm backdrop-blur-[2px]",
        className
      )}
      defaultOpen={defaultOpen}
      {...props}
    />
  );
});

export type ChainOfThoughtHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  /** Optional leading affordance instead of the default icon label. */
  icon?: ReactNode;
};

export const ChainOfThoughtHeader = memo(function ChainOfThoughtHeader({
  className,
  children,
  icon,
  ...props
}: ChainOfThoughtHeaderProps) {
  return (
    <CollapsibleTrigger
      data-slot="chain-of-thought-header"
      className={cn(
        "group flex h-auto min-h-10 w-full items-center gap-2 rounded-none border-b border-border/50 bg-muted/30 px-3 py-2 text-left transition-colors hover:bg-muted/50",
        className
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-foreground">
        {icon ?? (
          <>
            <Brain className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate font-medium">Chain of thought</span>
          </>
        )}
        {children}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground group-data-panel-open:hidden" />
      <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground group-data-panel-open:block" />
    </CollapsibleTrigger>
  );
});

export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>;

export const ChainOfThoughtContent = memo(function ChainOfThoughtContent({
  className,
  ...props
}: ChainOfThoughtContentProps) {
  return (
    <CollapsibleContent
      data-slot="chain-of-thought-content"
      keepMounted
      className={cn("text-sm data-closed:animate-out data-closed:fade-out-0", className)}
      {...props}
    />
  );
});

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
};

const stepStyles = {
  complete: "text-muted-foreground",
  active: "text-foreground font-medium",
  pending: "text-muted-foreground/45",
} as const;

export const ChainOfThoughtStep = memo(function ChainOfThoughtStep({
  className,
  label,
  description,
  status = "complete",
  children,
  ...props
}: ChainOfThoughtStepProps) {
  return (
    <div
      data-slot="chain-of-thought-step"
      className={cn("border-l-2 border-border/60 pl-3", stepStyles[status], className)}
      {...props}
    >
      <div className="text-xs">{label}</div>
      {description ? (
        <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</div>
      ) : null}
      {children}
    </div>
  );
});

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;

export const ChainOfThoughtSearchResults = memo(function ChainOfThoughtSearchResults({
  className,
  ...props
}: ChainOfThoughtSearchResultsProps) {
  return (
    <div
      data-slot="chain-of-thought-search-results"
      className={cn("flex flex-wrap gap-1", className)}
      {...props}
    />
  );
});

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;

export const ChainOfThoughtSearchResult = memo(function ChainOfThoughtSearchResult({
  className,
  variant = "secondary",
  ...props
}: ChainOfThoughtSearchResultProps) {
  return <Badge data-slot="chain-of-thought-search-result" variant={variant} className={cn("font-normal", className)} {...props} />;
});

export type ChainOfThoughtImageProps = ComponentProps<"div"> & {
  caption?: string;
};

export const ChainOfThoughtImage = memo(function ChainOfThoughtImage({
  className,
  children,
  caption,
  ...props
}: ChainOfThoughtImageProps) {
  return (
    <figure data-slot="chain-of-thought-image" className={cn("space-y-1", className)} {...props}>
      <div className="overflow-hidden rounded-md border border-border">{children}</div>
      {caption ? <figcaption className="text-[11px] text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
});

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
