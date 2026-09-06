import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, Check, KanbanSquare, Play, Users } from "lucide-react";
import { queryClient } from "../lib/query-client";
import { currentUserQuery } from "../features/auth/queries/current-user-query";
import { getAccessToken } from "../lib/api/client";

export const Route = createFileRoute("/")({
  component: LandingPage,

  beforeLoad: async () => {
    if (!getAccessToken()) {
      return;
    }
    let user;
    try {
      user = await queryClient.ensureQueryData(currentUserQuery());
    } catch {
      return;
    }
    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-taskly-background text-taskly-foreground">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-taskly-brand text-lg font-bold shadow-lg shadow-blue-950/60">
            T
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Taskly
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-taskly-brand px-4 py-2 text-sm font-semibold text-white shadow-lg 
            shadow-blue-950/50 transition hover:bg-brand-500"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:pb-32 lg:pt-28">
        <div className="pointer-events-none absolute -right-48 -top-40 h-152 w-152 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-48 top-72 h-96 w-96 rounded-full bg-cyan-950/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl">
            Turn scattered work into
            <span className="block bg-linear-to-r from-blue-300 via-blue-500 to-cyan-300 bg-clip-text text-transparent pb-4">
              meaningful progress.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
            Taskly brings your projects, tasks and team into one focused
            workspace built for momentum.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-taskly-brand px-6 py-3.5 font-semibold text-white shadow-xl shadow-blue-950/60 transition hover:bg-[#1d4ed8]"
            >
              Start for free
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-3.5 font-semibold text-slate-200 transition hover:border-blue-800 hover:bg-blue-950/40"
            >
              <Play size={16} className="fill-current" />
              Explore your workspace
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl rounded-2xl border border-taskly bg-taskly-surface p-2 shadow-2xl shadow-blue-950/40 sm:mt-24">
          <div className="rounded-xl border border-slate-800 bg-[#06101D] p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-blue-600" />
                <span className="text-sm font-semibold text-slate-200">
                  Product launch
                </span>
              </div>
              <span className="text-xs text-slate-500">This week</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "To do",
                  color: "border-slate-700",
                  tasks: ["Research user needs", "Define launch goals"],
                },
                {
                  title: "In progress",
                  color: "border-blue-800",
                  tasks: ["Design landing page", "Prepare announcement"],
                },
                {
                  title: "Done",
                  color: "border-emerald-900",
                  tasks: ["Create workspace", "Invite the team"],
                },
              ].map((column) => (
                <div
                  key={column.title}
                  className={`rounded-xl border ${column.color} bg-slate-950/40 p-3`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {column.title}
                    </span>
                    <span className="text-xs text-slate-600">
                      {column.tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {column.tasks.map((task) => (
                      <div
                        key={task}
                        className="rounded-lg border border-taskly bg-taskly-surface-muted p-3 text-left text-sm text-taskly-foreground shadow-lg"
                      >
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-900 bg-[#050F1B]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-3">
          {[
            {
              icon: KanbanSquare,
              title: "See the whole picture",
              text: "Organize every project in boards that make priorities obvious.",
            },
            {
              icon: Users,
              title: "Move together",
              text: "Give your team context, ownership and a shared place to focus.",
            },
            {
              icon: Check,
              title: "Finish with confidence",
              text: "Keep momentum with clear tasks, activity and progress you can trust.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-blue-400">
                <Icon size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 Taskly</span>
        <span>Make progress visible.</span>
      </footer>
    </main>
  );
}
