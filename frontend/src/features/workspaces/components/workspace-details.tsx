import { Card } from "@/components/ui";
import type { Workspace } from "../workspace.types";
import { BriefcaseBusiness } from "lucide-react";
import { WorkspaceRow } from "./workspace-row";

interface Props {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  onSelected: (value: string) => void;
}
export const WorkspaceDetails = ({
  workspaces,
  selectedWorkspaceId,
  onSelected,
}: Props) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-taskly px-5 py-4">
        <div>
          <h2 className="font-semibold text-white">Your workspaces</h2>
          <p className="mt-1 text-sm text-taskly-muted">
            Select one to see its boards.
          </p>
        </div>
        <BriefcaseBusiness size={18} className="text-taskly-brand" />
      </div>
      <div className="divide-y divide-slate-800/80">
        {workspaces.map((workspace) => (
          <WorkspaceRow
            key={workspace.id}
            workspace={workspace}
            selected={workspace.id === selectedWorkspaceId}
            onSelect={() => onSelected(workspace.id)}
          />
        ))}
      </div>
    </Card>
  );
};
