import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FolderKanban, LayoutDashboard } from "lucide-react";
import { Badge, Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useBoardDetail } from "@/features/boards/hooks/use-boards";

export const Route = createFileRoute("/_authenticated/boards/$boardId")({
  component: BoardPage,
});

function BoardPage() {
  const { boardId } = useParams({ from: "/_authenticated/boards/$boardId" });
  const { data, isLoading, isError, error, refetch } = useBoardDetail(boardId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-12 w-96 max-w-full" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Board unavailable"
        description={getApiErrorMessage(error, "Unable to load this board.")}
        action={
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Board not found"
        description="This board may have been removed or you may not have access to it."
        action={
          <Link to="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        }
      />
    );
  }

  const board = data;

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-taskly-muted hover:text-taskly-foreground"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-taskly-brand-soft text-taskly-brand">
            <FolderKanban size={22} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-taskly-foreground">
                {board.name}
              </h1>
              <Badge tone={board.isArchived ? "slate" : "blue"}>
                {board.isArchived ? "Archived" : "Active"}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-taskly-muted">
              {board.description ||
                "This board is ready for tasks and collaboration."}
            </p>
          </div>
        </div>
      </section>
      <Card className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
        <LayoutDashboard className="mb-3 text-taskly-brand" size={28} />
        <h2 className="text-lg font-semibold text-taskly-foreground">
          Your board workspace is ready
        </h2>
        <p className="mt-2 max-w-md text-sm text-taskly-muted">
          Columns, tasks and drag-and-drop organization will be added in the
          next phase.
        </p>
      </Card>
    </div>
  );
}
