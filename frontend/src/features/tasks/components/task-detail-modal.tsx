import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, MessageSquare, Paperclip, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import type { TaskDetail, TaskPriority } from "../tasks.type";
import {
  useCreateChecklist,
  useCreateChecklistItem,
  useCreateComment,
  useDeleteComment,
  useTaskDetail,
  useToggleChecklistItem,
  useUpdateComment,
  useUpdateTask,
  useAddTaskAssignee,
  useRemoveTaskAssignee,
  useAddTaskLabel,
  useRemoveTaskLabel,
} from "../hooks/use-task";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useActivity, activityLabel } from "@/features/activity/use-activity";
import { useBoardDetail } from "@/features/boards/hooks/use-boards";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useLabels } from "@/features/labels/use-labels";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";

export const TaskDetailPage = ({ taskId }: { taskId: string }) => {
  const detailQuery = useTaskDetail(taskId);
  const updateTask = useUpdateTask(detailQuery.data?.boardId ?? "");
  const [draft, setDraft] = useState<Pick<
    TaskDetail,
    "title" | "description" | "priority" | "dueDate"
  > | null>(null);
  const [comment, setComment] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});
  const createComment = useCreateComment(taskId ?? "");
  const updateComment = useUpdateComment(taskId ?? "");
  const deleteComment = useDeleteComment(taskId ?? "");
  const createChecklist = useCreateChecklist(taskId ?? "");
  const createItem = useCreateChecklistItem(taskId ?? "");
  const toggleItem = useToggleChecklistItem(taskId ?? "");
  const activityQuery = useActivity("task", taskId);
  const boardQuery = useBoardDetail(detailQuery.data?.boardId ?? "");
  const workspaceId = boardQuery.data?.workspaceId ?? "";
  const membersQuery = useWorkspaceMembers(workspaceId);
  const labelsQuery = useLabels(workspaceId);
  const workspacesQuery = useWorkspaces();
  const workspaceRole = workspacesQuery.data?.find((item) => item.id === workspaceId)?.role;
  const canEditCollaboration = workspaceRole !== "viewer";
  const addAssignee = useAddTaskAssignee(taskId);
  const removeAssignee = useRemoveTaskAssignee(taskId);
  const addLabel = useAddTaskLabel(taskId);
  const removeLabel = useRemoveTaskLabel(taskId);

  useEffect(() => {
    if (detailQuery.data) {
      // Reset editable fields when the selected task changes or finishes loading.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft({
        title: detailQuery.data.title,
        description: detailQuery.data.description ?? "",
        priority: detailQuery.data.priority,
        dueDate: detailQuery.data.dueDate?.slice(0, 10) ?? "",
      });
    }
  }, [detailQuery.data]);

  if (detailQuery.isLoading || !draft) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-taskly bg-taskly-surface p-8">
        <p className="text-sm text-taskly-muted">Loading task...</p>
      </div>
    );
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-taskly bg-taskly-surface p-8">
        <p className="text-sm text-danger">Unable to load this task.</p>
      </div>
    );
  }

  const task = detailQuery.data;
  const saveTask = async () => {
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        payload: {
          title: draft.title.trim(),
          description: draft.description?.trim() || undefined,
          priority: draft.priority,
          dueDate: draft.dueDate || undefined,
        },
      });
      toast.success("Task updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update task"));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-taskly-foreground">Task details</h1>
        <Link to="/boards/$boardId" params={{ boardId: task.boardId }} className="text-sm text-taskly-brand hover:underline">
          Back to board
        </Link>
      </div>
      <div className="space-y-6 rounded-2xl border border-taskly bg-taskly-surface p-5 sm:p-8">
        <section className="space-y-3">
          <Input
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
          />
          <textarea
            className="min-h-28 w-full rounded-lg border border-taskly bg-taskly-surface-muted p-3 text-sm text-taskly-foreground outline-none"
            value={draft.description ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            placeholder="Description"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="rounded-lg border border-taskly bg-taskly-surface-muted p-3 text-sm text-taskly-foreground"
              value={draft.priority}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  priority: event.target.value as TaskPriority,
                })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <Input
              type="date"
              value={draft.dueDate ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, dueDate: event.target.value })
              }
            />
          </div>
          <Button
            onClick={() => void saveTask()}
            disabled={updateTask.isPending}
          >
            Save changes
          </Button>
        </section>

        <section className="space-y-3 border-t border-taskly pt-5">
          <h3 className="flex items-center gap-2 font-semibold text-taskly-foreground">
            <Check size={16} /> Checklists
          </h3>
          {task.checklists.map((checklist) => (
            <div
              key={checklist.id}
              className="rounded-lg border border-taskly bg-taskly-surface-muted p-3"
            >
              <p className="font-medium text-taskly-foreground">
                {checklist.title}
              </p>
              <div className="mt-2 space-y-2">
                {checklist.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem.mutate(item.id)}
                    className="flex w-full items-center gap-2 text-left text-sm text-taskly-muted"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${item.isDone ? "border-success bg-success text-white" : "border-taskly"}`}
                    >
                      {item.isDone && <Check size={12} />}
                    </span>
                    <span className={item.isDone ? "line-through" : ""}>
                      {item.content}
                    </span>
                  </button>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="New checklist item"
                    value={itemDrafts[checklist.id] ?? ""}
                    onChange={(event) =>
                      setItemDrafts({
                        ...itemDrafts,
                        [checklist.id]: event.target.value,
                      })
                    }
                  />
                  <Button
                    onClick={() => {
                      const content = itemDrafts[checklist.id]?.trim();
                      if (content) {
                        createItem.mutate({
                          checklistId: checklist.id,
                          content,
                        });
                        setItemDrafts({ ...itemDrafts, [checklist.id]: "" });
                      }
                    }}
                  >
                    <Plus size={15} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="New checklist"
              value={checklistTitle}
              onChange={(event) => setChecklistTitle(event.target.value)}
            />
            <Button
              onClick={() => {
                const title = checklistTitle.trim();
                if (title) {
                  createChecklist.mutate(title);
                  setChecklistTitle("");
                }
              }}
            >
              <Plus size={15} />
            </Button>
          </div>
        </section>

        <section className="grid gap-5 border-t border-taskly pt-5 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-semibold text-taskly-foreground">Assignees</h3>
            <div className="flex flex-wrap gap-2">
              {task.assignees.map((assignee) => (
                <span key={assignee.userId} className="inline-flex items-center gap-2 rounded-full bg-taskly-brand-soft px-3 py-1 text-xs text-taskly-foreground">
                  {assignee.user.fullName}
                  {canEditCollaboration && <button type="button" onClick={() => removeAssignee.mutate(assignee.userId)} aria-label={`Remove ${assignee.user.fullName}`}>
                    <X size={12} />
                  </button>}
                </span>
              ))}
            </div>
            {canEditCollaboration && <select className="w-full rounded-lg border border-taskly bg-taskly-surface-muted p-2.5 text-sm text-taskly-foreground" value="" onChange={(event) => { if (event.target.value) addAssignee.mutate(event.target.value); }}>
              <option value="">Assign a member...</option>
              {membersQuery.data?.filter((member) => !task.assignees.some((assignee) => assignee.userId === member.userId)).map((member) => (
                <option key={member.userId} value={member.userId}>{member.fullName}</option>
              ))}
            </select>}
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-taskly-foreground">Labels</h3>
            <div className="flex flex-wrap gap-2">
              {task.labels.map((taskLabel) => (
                <span key={taskLabel.labelId} className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: taskLabel.label.color }}>
                  {taskLabel.label.name}
                  {canEditCollaboration && <button type="button" onClick={() => removeLabel.mutate(taskLabel.labelId)} aria-label={`Remove ${taskLabel.label.name}`}><X size={12} /></button>}
                </span>
              ))}
            </div>
            {canEditCollaboration && <select className="w-full rounded-lg border border-taskly bg-taskly-surface-muted p-2.5 text-sm text-taskly-foreground" value="" onChange={(event) => { if (event.target.value) addLabel.mutate(event.target.value); }}>
              <option value="">Add a label...</option>
              {labelsQuery.data?.filter((label) => !task.labels.some((taskLabel) => taskLabel.labelId === label.id)).map((label) => (
                <option key={label.id} value={label.id}>{label.name}</option>
              ))}
            </select>}
          </div>
        </section>

        <section className="space-y-3 border-t border-taskly pt-5">
          <h3 className="flex items-center gap-2 font-semibold text-taskly-foreground">
            <MessageSquare size={16} /> Comments
          </h3>
          {task.comments.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-taskly bg-taskly-surface-muted p-3"
            >
              <p className="text-xs text-taskly-muted">
                {entry.user?.fullName ?? "User"} ·{" "}
                {new Date(entry.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-taskly-foreground">
                {entry.content}
              </p>
              {entry.userId && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-taskly-brand"
                    onClick={() => {
                      const content = window.prompt(
                        "Edit comment",
                        entry.content,
                      );
                      if (content?.trim())
                        updateComment.mutate({
                          commentId: entry.id,
                          content: content.trim(),
                        });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs text-danger"
                    onClick={() => deleteComment.mutate(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <Button
              onClick={() => {
                if (comment.trim()) {
                  createComment.mutate(comment.trim());
                  setComment("");
                }
              }}
            >
              Send
            </Button>
          </div>
        </section>

        <section className="space-y-3 border-t border-taskly pt-5">
          <h3 className="flex items-center gap-2 font-semibold text-taskly-foreground">
            <Paperclip size={16} /> Attachments
          </h3>
          {task.attachments.length === 0 ? (
            <p className="text-sm text-taskly-muted">No attachments.</p>
          ) : (
            task.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-taskly-brand hover:underline"
              >
                {attachment.fileName}
              </a>
            ))
          )}
        </section>

        <section className="space-y-3 border-t border-taskly pt-5">
          <h3 className="font-semibold text-taskly-foreground">Activity</h3>
          {activityQuery.isLoading ? (
            <p className="text-sm text-taskly-muted">Loading activity...</p>
          ) : activityQuery.data?.length ? (
            activityQuery.data.map((entry) => (
              <div key={entry.id} className="border-l-2 border-taskly-brand pl-3">
                <p className="text-sm text-taskly-foreground">{activityLabel(entry.action)}</p>
                <p className="text-xs text-taskly-muted">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-taskly-muted">No activity yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};
