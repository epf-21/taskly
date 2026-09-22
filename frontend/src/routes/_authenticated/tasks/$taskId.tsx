import { createFileRoute, useParams } from "@tanstack/react-router";
import { TaskDetailPage } from "@/features/tasks/components";

export const Route = createFileRoute("/_authenticated/tasks/$taskId")({
  component: TaskDetailRoute,
});

function TaskDetailRoute() {
  const { taskId } = useParams({ from: "/_authenticated/tasks/$taskId" });
  return <TaskDetailPage taskId={taskId} />;
}
