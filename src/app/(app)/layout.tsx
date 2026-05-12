export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
