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
          className="cursor-pointer rounded-lg border border-transparent p-2 text-taskly-muted transition-colors hover:border-taskly-strong hover:bg-taskly-surface-muted hover:text-taskly-foreground lg:hidden"
        >
          <Menu size={19} aria-hidden="true" />
        </button>
        <nav aria-label="Breadcrumb" className="text-sm text-taskly-muted">
          <span className="text-taskly-subtle">Workspace</span>
          <span aria-hidden="true" className="mx-2 text-taskly-subtle">
            /
          </span>
          <span aria-current="page" className="text-taskly-foreground">
            {currentSection}
          </span>
        </nav>
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
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-taskly-strong bg-taskly-surface-muted text-taskly-foreground transition-colors hover:bg-taskly-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
