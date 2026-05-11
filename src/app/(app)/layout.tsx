export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex min-h-svh flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
