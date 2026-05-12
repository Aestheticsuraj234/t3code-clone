import { WorkspaceIde } from "@/features/workspace-shell/components/workspace-ide";

type Props = {
  params: Promise<{ projectId: string; threadId: string }>;
};

export default async function ThreadWorkspacePage({ params }: Props) {
  const { projectId, threadId } = await params;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <WorkspaceIde projectId={projectId} threadId={threadId} />
    </div>
  );
}
