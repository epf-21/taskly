import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  ListTodo,
} from "lucide-react";
import { useEffect } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useCurrentUser } from "../../features/auth/hook/use-current-user";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (isError) {
      void navigate({ to: "/login", replace: true });
    }
  }, [isError, navigate]);
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        {" "}
        <p className="text-taskly-muted">Loading...</p>{" "}
      </div>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-taskly-brand">
            Thursday, September 3
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Good morning, welcome back.
          </h1>
          <p className="mt-2 text-taskly-muted">
            Here is what is happening across your projects.
          </p>
        </div>
        <Button>
          <ListTodo size={17} /> Create task
        </Button>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between text-taskly-muted">
            <span className="text-sm">Active tasks</span>
            <ListTodo size={18} className="text-taskly-brand" />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">24</p>
          <p className="mt-2 text-xs text-green-400">+12% from last week</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm">Completed</span>
            <CheckCircle2 size={18} className="text-green-400" />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">18</p>
          <p className="mt-2 text-xs text-slate-500">This week</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm">Due soon</span>
            <CircleDashed size={18} className="text-amber-400" />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">5</p>
          <p className="mt-2 text-xs text-amber-400">Next 24 hours</p>
        </Card>
      </section>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Recent workspaces</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your most recently visited projects.
            </p>
          </div>
          <button className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            View all <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="divide-y divide-slate-800/80">
          {["Product Design", "Marketing Launch", "Engineering"].map(
            (workspace, index) => (
              <div
                key={workspace}
                className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-800/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 font-semibold text-blue-300">
                    {workspace.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {workspace}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {index + 2} boards · Updated recently
                    </p>
                  </div>
                </div>
                <Badge tone={index === 0 ? "blue" : "slate"}>
                  {index === 0 ? "Active" : "Member"}
                </Badge>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}
