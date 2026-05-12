import type { ThreadStatus } from "../../../../generated/browser";

export type ThreadStatusTone = "muted" | "info" | "success" | "warning" | "danger";

export type ThreadStatusIndicator = {
  status: ThreadStatus;
  label: string;
  tone: ThreadStatusTone;
};

const UI: Record<ThreadStatus, Omit<ThreadStatusIndicator, "status">> = {
  QUEUED: { label: "Queued", tone: "muted" },
  RUNNING: { label: "Running", tone: "info" },
  COMPLETED: { label: "Done", tone: "success" },
  ERROR: { label: "Error", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "warning" },
};

export function threadStatusIndicator(status: ThreadStatus): ThreadStatusIndicator {
  const row = UI[status];
  return { status, label: row.label, tone: row.tone };
}

export function threadStatusDotClass(tone: ThreadStatusTone): string {
  const map: Record<ThreadStatusTone, string> = {
    muted: "bg-muted-foreground/60",
    info: "bg-sky-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-destructive",
  };
  return `size-1.5 shrink-0 rounded-full ${map[tone]}`;
}
