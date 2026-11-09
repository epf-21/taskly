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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-taskly bg-taskly-background px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => onClick()}
          className="rounded-lg border border-transparent p-2 text-taskly-muted transition hover:border-taskly hover:bg-taskly-surface-muted hover:text-taskly-foreground lg:hidden"
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-taskly bg-taskly-surface-muted text-taskly-foreground transition hover:bg-taskly-surface"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
