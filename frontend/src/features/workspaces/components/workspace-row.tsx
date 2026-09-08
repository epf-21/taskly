import { Badge } from "@/components/ui";
import type { Workspace } from "../workspace.types";

interface Props {
  workspace: Workspace;
  selected: boolean;
  onSelect: () => void;
}
export const WorkspaceRow = ({ workspace, selected, onSelect }: Props) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 px-5 py-4 text-left transition ${
        selected ? "bg-taskly-brand-soft" : "hover:bg-taskly-surface-muted"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-taskly-brand-soft font-semibold text-taskly-brand">
        {workspace.name.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-taskly-foreground">
          {workspace.name}
        </span>
        <span className="mt-1 block text-xs text-taskly-muted">
          {workspace.slug}
        </span>
      </span>
      <Badge
        tone={
          workspace.role === "owner" || workspace.role === "admin"
            ? "blue"
            : "slate"
        }
      >
        {workspace.role}
      </Badge>
    </button>
  );
};
