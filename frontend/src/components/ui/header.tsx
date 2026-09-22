import { LogOut, Menu } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useCurrentUser } from "@/features/auth/hook/use-current-user";
import { useLogout } from "@/features/auth/hook/use-logout";
import { getCurrentSection } from "@/utils/navigation";

interface Props {
  onClick: () => void;
}
export const Header = ({ onClick }: Props) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();

  const currentSection = getCurrentSection(pathname);
  return (
    <header className="flex h-16 items-center justify-between border-b border-taskly px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => onClick()}
          className="rounded-lg p-2 text-taskly-muted hover:bg-taskly-surface-muted hover:text-taskly-foreground lg:hidden"
        >
          <Menu size={19} />
        </button>
        <div className="text-sm text-taskly-muted">
          Workspace / {currentSection}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-taskly-muted sm:block">
          {user?.fullName ?? "User"}
        </span>
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          disabled={isPending}
          onClick={() => logout()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-taskly-brand-soft text-taskly-brand transition hover:bg-taskly-surface-muted"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
