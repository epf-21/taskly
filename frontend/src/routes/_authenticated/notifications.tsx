import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/use-notifications";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const query = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  if (query.isLoading) return <Skeleton className="h-96" />;
  if (query.isError)
    return <EmptyState title="Notifications unavailable" description="Try again later." action={<Button onClick={() => void query.refetch()}>Retry</Button>} />;

  const notifications = query.data ?? [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-taskly-brand">Activity center</p>
          <h1 className="text-3xl font-bold text-taskly-foreground">Notifications</h1>
        </div>
        <Button variant="secondary" onClick={() => markAll.mutate()} disabled={!notifications.some((item) => !item.readAt)}>
          <CheckCheck size={16} /> Mark all read
        </Button>
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="New assignments, mentions and reminders will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const taskId = typeof notification.payload.taskId === "string" ? notification.payload.taskId : null;
            const title = typeof notification.payload.taskTitle === "string" ? notification.payload.taskTitle : "Taskly activity";
            const content = `${notification.type.replaceAll("_", " ")}: ${title}`;
            return (
              <Card key={notification.id} className={`p-4 ${notification.readAt ? "opacity-70" : "border-taskly-brand"}`}>
                <div className="flex items-start gap-3">
                  <Bell size={18} className="mt-1 text-taskly-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-taskly-foreground">{content}</p>
                    <p className="mt-1 text-xs text-taskly-muted">{new Date(notification.createdAt).toLocaleString()}</p>
                    <div className="mt-3 flex gap-3">
                      {taskId && <Link to="/tasks/$taskId" params={{ taskId }} className="text-xs text-taskly-brand hover:underline">Open task</Link>}
                      {!notification.readAt && <button type="button" onClick={() => markRead.mutate(notification.id)} className="text-xs text-taskly-muted hover:text-taskly-foreground">Mark read</button>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
