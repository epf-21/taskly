import { Button } from "@/components/ui";
import type { Workspace } from "@/features/workspaces/workspace.types";
import { FolderKanban, Plus } from "lucide-react";

interface Props {
  user?: {
    fullName?: string | null;
  } | null;
  selectedWorkspace?: Workspace;
  canManageWorkspace?: boolean;
  onNewWorkspace: () => void;
  onNewBoard: () => void;
}

export const DashboardHeader = ({
  user,
  selectedWorkspace,
  canManageWorkspace,
  onNewWorkspace,
  onNewBoard,
}: Props) => {
  const firstName = user?.fullName ? `, ${user.fullName.split(" ")[0]}` : "";
  return (
    <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <p className="mb-2 text-sm font-medium text-taskly-brand">
          Workspace overview
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-taskly-foreground">
          Welcome back
          {firstName}
        </h1>
        <p className="mt-2 text-taskly-muted">
          Keep your projects moving from one focused workspace.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onNewWorkspace}>
          <Plus size={17} aria-hidden="true" /> New workspace
        </Button>
        {selectedWorkspace && canManageWorkspace && (
          <Button onClick={onNewBoard}>
            <FolderKanban size={17} aria-hidden="true" /> New board
          </Button>
        )}
      </div>
    </section>
  );
};
