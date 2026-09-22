import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, EmptyState, Input, Skeleton } from "@/components/ui";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import {
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
  useWorkspaceMembers,
} from "@/features/workspaces/hooks/use-workspace-members";
import { useCreateLabel, useDeleteLabel, useLabels, useUpdateLabel } from "@/features/labels/use-labels";
import type { WorkspaceRole } from "@/features/workspaces/workspace.types";
import { getApiErrorMessage } from "@/lib/api/errors";

export const Route = createFileRoute("/_authenticated/workspaces")({
  component: WorkspacesPage,
});

function WorkspacesPage() {
  const workspacesQuery = useWorkspaces();
  const [selectedId, setSelectedId] = useState("");
  const workspaces = workspacesQuery.data ?? [];
  const workspace = workspaces.find((item) => item.id === (selectedId || workspaces[0]?.id));
  const membersQuery = useWorkspaceMembers(workspace?.id ?? "");
  const updateRole = useUpdateMemberRole(workspace?.id ?? "");
  const removeMember = useRemoveMember(workspace?.id ?? "");
  const inviteMember = useInviteMember(workspace?.id ?? "");
  const labelsQuery = useLabels(workspace?.id ?? "");
  const createLabel = useCreateLabel(workspace?.id ?? "");
  const updateLabel = useUpdateLabel(workspace?.id ?? "");
  const deleteLabel = useDeleteLabel(workspace?.id ?? "");
  const [email, setEmail] = useState("");
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#3B82F6");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState("");
  const canManage = workspace?.role === "owner" || workspace?.role === "admin";

  if (workspacesQuery.isLoading) return <Skeleton className="h-96" />;
  if (workspacesQuery.isError) {
    return <EmptyState title="Workspaces unavailable" description="Try again later." action={<Button onClick={() => void workspacesQuery.refetch()}>Retry</Button>} />;
  }

  if (!workspace) {
    return <EmptyState title="No workspaces yet" description="Create a workspace from the overview." />;
  }

  const run = async (operation: () => Promise<unknown>, success: string) => {
    try {
      await operation();
      toast.success(success);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to complete action"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-taskly-brand">Workspace administration</p>
        <h1 className="text-3xl font-bold text-taskly-foreground">Workspaces</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <Card className="h-fit p-2">
          {workspaces.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full rounded-lg px-3 py-3 text-left text-sm ${item.id === workspace.id ? "bg-taskly-brand-soft text-taskly-brand" : "text-taskly-muted hover:bg-taskly-surface-muted"}`}>
              <span className="block font-medium">{item.name}</span>
              <span className="text-xs">{item.role}</span>
            </button>
          ))}
        </Card>
        <Card className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-taskly pb-5">
            <div>
              <h2 className="text-xl font-semibold text-taskly-foreground">{workspace.name}</h2>
              <p className="mt-1 text-sm text-taskly-muted">{workspace.description || "Manage access and collaboration."}</p>
            </div>
            <span className="rounded-full bg-taskly-brand-soft px-3 py-1 text-xs text-taskly-brand">{workspace.role}</span>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <Users size={18} className="text-taskly-brand" />
            <h3 className="font-semibold text-taskly-foreground">Members</h3>
          </div>
          {canManage && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="member@email.com" type="email" />
              <select id="invite-role" className="rounded-lg border border-taskly bg-taskly-surface-muted px-3 text-sm text-taskly-foreground">
                <option value="member">Member</option><option value="admin">Admin</option><option value="viewer">Viewer</option>
              </select>
              <Button onClick={() => { const role = (document.getElementById("invite-role") as HTMLSelectElement).value as WorkspaceRole; if (email.trim()) void run(() => inviteMember.mutateAsync({ email: email.trim(), role }), "Invitation sent").then(() => setEmail("")); }}><UserPlus size={16} /> Invite</Button>
            </div>
          )}
          <div className="mt-5 space-y-2">
            {membersQuery.isLoading ? <Skeleton className="h-32" /> : membersQuery.data?.map((member) => (
              <div key={member.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-taskly bg-taskly-surface-muted p-3">
                <div><p className="text-sm font-medium text-taskly-foreground">{member.fullName}</p><p className="text-xs text-taskly-muted">{member.email}</p></div>
                <div className="flex items-center gap-2">
                  <select disabled={!canManage || member.role === "owner"} value={member.role} onChange={(event) => void run(() => updateRole.mutateAsync({ userId: member.userId, role: event.target.value as WorkspaceRole }), "Role updated")} className="rounded border border-taskly bg-taskly-surface px-2 py-1 text-xs text-taskly-foreground">
                    <option value="owner">Owner</option><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option>
                  </select>
                  {canManage && member.role !== "owner" && <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => void run(() => removeMember.mutateAsync(member.userId), "Member removed")}>Remove</Button>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-taskly pt-5">
            <h3 className="font-semibold text-taskly-foreground">Labels</h3>
            {canManage && <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input value={labelName} onChange={(event) => setLabelName(event.target.value)} placeholder="Label name" />
              <input aria-label="Label color" type="color" value={labelColor} onChange={(event) => setLabelColor(event.target.value)} className="h-10 w-14 rounded border border-taskly bg-taskly-surface-muted p-1" />
              <Button onClick={() => { if (labelName.trim()) void run(() => createLabel.mutateAsync({ name: labelName.trim(), color: labelColor }), "Label created").then(() => setLabelName("")); }}>Create label</Button>
            </div>}
            <div className="mt-3 flex flex-wrap gap-2">
              {labelsQuery.data?.map((label) => <div key={label.id} className="flex items-center gap-2 rounded-full border border-taskly px-3 py-1.5 text-xs text-taskly-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                {editingLabelId === label.id ? <><input autoFocus value={editingLabelName} onChange={(event) => setEditingLabelName(event.target.value)} className="w-24 rounded border border-taskly bg-taskly-surface-muted px-1 py-0.5" /><button type="button" onClick={() => { if (editingLabelName.trim()) void run(() => updateLabel.mutateAsync({ labelId: label.id, payload: { name: editingLabelName.trim() } }), "Label updated").then(() => setEditingLabelId(null)); }}>Save</button></> : <>{label.name}{canManage && <button type="button" className="text-taskly-muted hover:text-taskly-foreground" onClick={() => { setEditingLabelId(label.id); setEditingLabelName(label.name); }}>Edit</button>}</>}
                {canManage && <button type="button" className="text-taskly-danger" onClick={() => void run(() => deleteLabel.mutateAsync(label.id), "Label deleted")}>Delete</button>}
              </div>)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
