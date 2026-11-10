import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Check,
  FolderKanban,
  History,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
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

const capabilities = [
  {
    icon: FolderKanban,
    title: "Boards and columns",
    text: "Organize work in Kanban boards, move tasks across stages, and keep every project visible.",
  },
  {
    icon: Users,
    title: "Teams and roles",
    text: "Invite collaborators and control access with workspace and board-level permissions.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    text: "JWT sessions with rotating refresh tokens and explicit, enforceable role boundaries.",
  },
  {
    icon: History,
    title: "Activity and context",
    text: "Comments, checklists, attachments, and an activity trail stay attached to the task.",
  },
];

const previewColumns = [
  {
    name: "To do",
    tone: "text-taskly-muted",
    tasks: ["Define onboarding flow", "Draft release notes"],
  },
  {
    name: "In progress",
    tone: "text-amber-300",
    tasks: ["Build workspace settings"],
  },
  {
    name: "Done",
    tone: "text-emerald-300",
    tasks: ["Role-based permissions"],
  },
];

const plans = [
  {
    tier: "Starter",
    price: "$0",
    summary: "For small teams getting organized.",
    items: ["Up to 5 members", "3 workspaces", "Kanban boards", "Email notifications"],
    highlight: false,
  },
  {
    tier: "Team",
    price: "$39",
    summary: "For growing teams that need control.",
    items: ["Unlimited members", "Advanced permissions", "Activity history", "Priority support"],
    highlight: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    summary: "For organizations with security needs.",
    items: ["SSO and security policies", "SLA and dedicated support", "Custom retention", "Executive reporting"],
    highlight: false,
  },
];

function LandingPage() {
  return (
    <main className="min-h-dvh bg-taskly-background text-taskly-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/40 bg-brand-600 text-lg font-bold text-white">
            T
          </span>
          <span className="text-xl font-bold tracking-tight">Taskly</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-taskly-muted transition-colors hover:bg-taskly-surface-muted hover:text-taskly-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-taskly-strong bg-taskly-surface px-3 py-1.5 text-xs font-medium text-taskly-muted">
            Built for focused teams
          </span>
          <h1 className="mt-6 max-w-xl text-balance text-4xl font-bold leading-tight sm:text-5xl">
            Project management that keeps work moving.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-taskly-muted sm:text-lg">
            Plan work in boards, assign clear ownership, and keep conversations,
            permissions, and progress in one shared workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Start free
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-taskly-strong bg-taskly-surface px-6 py-3 font-semibold text-taskly-foreground transition-colors hover:bg-taskly-surface-muted"
            >
              Sign in
            </Link>
          </div>
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Kanban workflow", value: "Boards" },
              { label: "Access control", value: "Roles" },
              { label: "Team context", value: "Activity" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-taskly bg-taskly-surface p-4"
              >
                <dt className="text-xs text-taskly-subtle">{item.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-taskly bg-taskly-surface p-4 shadow-sm shadow-black/20 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-taskly-brand-soft text-taskly-brand">
                <LayoutDashboard size={16} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Product launch</p>
                <p className="text-xs text-taskly-subtle">
                  3 columns · 4 tasks
                </p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              On track
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {previewColumns.map((column) => (
              <div
                key={column.name}
                className="rounded-lg border border-taskly bg-taskly-surface-muted p-2"
              >
                <p className={`mb-2 text-xs font-semibold ${column.tone}`}>
                  {column.name}
                </p>
                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <div
                      key={task}
                      className="rounded-md border border-taskly bg-taskly-surface p-2 text-[11px] leading-snug text-taskly-foreground"
                    >
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-taskly bg-surface/50">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Everything a team needs to execute
            </h2>
            <p className="mt-3 text-taskly-muted">
              One place for planning, coordination, and the context behind every
              decision.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {capabilities.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-xl border border-taskly bg-taskly-surface p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-taskly-brand-soft text-taskly-brand">
                  <Icon size={19} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-taskly-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Simple pricing for every stage
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-taskly-muted">
            Start small and add capacity, controls, and support as your team grows.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.tier}
              className={`rounded-xl border p-6 ${
                plan.highlight
                  ? "border-brand-500/50 bg-taskly-surface"
                  : "border-taskly bg-taskly-surface"
              }`}
            >
              <div className="mb-5">
                <h3 className="text-lg font-semibold">{plan.tier}</h3>
                <p className="mt-1 text-sm text-taskly-muted">{plan.summary}</p>
              </div>
              <p className="mb-6 text-3xl font-bold">{plan.price}</p>
              <ul className="space-y-2">
                {plan.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-taskly-foreground"
                  >
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-taskly-brand"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.tier === "Enterprise" ? "/login" : "/register"}
                className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-brand-600 text-white hover:bg-brand-500"
                    : "border border-taskly-strong bg-taskly-surface-muted text-taskly-foreground hover:bg-taskly-elevated"
                }`}
              >
                {plan.tier === "Enterprise" ? "Contact sales" : "Get started"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-taskly bg-surface/50">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, label: "Role-based access" },
            { icon: Bell, label: "Notifications" },
            { icon: History, label: "Activity history" },
            { icon: Users, label: "Team collaboration" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-taskly bg-taskly-surface px-4 py-3"
            >
              <Icon size={18} className="text-taskly-brand" aria-hidden="true" />
              <span className="text-sm font-medium text-taskly-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-taskly-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 Taskly</span>
        <span>Make progress visible.</span>
      </footer>
    </main>
  );
}
