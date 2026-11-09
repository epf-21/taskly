import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Check,
  Clock3,
  Globe2,
  LockKeyhole,
  Play,
  Sparkles,
  Users,
  Zap,
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

function LandingPage() {
  const metrics = [
    { label: "Events per minute", value: "128,420", delta: "+12.4%" },
    { label: "Active teams", value: "2,916", delta: "+8.1%" },
    { label: "SLA compliance", value: "99.97%", delta: "+0.3%" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Real-time signal",
      text: "Track spikes, drop-offs, and campaign impact as they happen with live boards and instant updates.",
    },
    {
      icon: Users,
      title: "Aligned teams",
      text: "Product, growth, and ops share one source of truth with role-based access and clear ownership.",
    },
    {
      icon: LockKeyhole,
      title: "Enterprise-ready security",
      text: "Permissions, audit trails, and controlled collaboration built for teams handling critical workflows.",
    },
    {
      icon: Clock3,
      title: "Operational clarity",
      text: "Reduce status meetings with transparent progress, dependencies, and alerts in one dashboard.",
    },
  ];

  const pricing = [
    {
      tier: "Starter",
      price: "$0",
      period: "/month",
      summary: "For small teams validating workflow.",
      cta: "Start free",
      highlight: false,
      items: [
        "Up to 5 members",
        "3 active workspaces",
        "Core analytics overview",
        "Email notifications",
      ],
    },
    {
      tier: "Growth",
      price: "$39",
      period: "/month",
      summary: "For scaling teams that need visibility.",
      cta: "Choose Growth",
      highlight: true,
      items: [
        "Unlimited members",
        "Advanced analytics panels",
        "Priority automations",
        "Role-based controls",
      ],
    },
    {
      tier: "Enterprise",
      price: "Custom",
      period: "",
      summary: "For multi-team organizations.",
      cta: "Contact sales",
      highlight: false,
      items: [
        "SSO + security policies",
        "SLA and dedicated support",
        "Custom data retention",
        "Executive reporting",
      ],
    },
  ];

  return (
    <main className="min-h-dvh overflow-hidden bg-taskly-background text-taskly-foreground">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-800/50 bg-taskly-brand text-lg font-bold shadow-lg shadow-blue-950/60">
            T
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Taskly
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-taskly-muted transition hover:bg-taskly-surface-muted hover:text-taskly-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-taskly-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/50 transition hover:bg-brand-500"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -right-40 -top-28 h-[30rem] w-[30rem] rounded-full bg-brand-100/30 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-taskly bg-taskly-surface-muted px-4 py-2 text-xs font-semibold tracking-wide text-taskly-muted">
              <Sparkles size={14} aria-hidden="true" />
              REAL-TIME ANALYTICS
            </div>
            <h1 className="max-w-2xl text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Analytics dashboards built for serious execution
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Monitor live performance, collaborate on priorities, and turn data
              into action with a dashboard designed for clarity and execution.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-taskly-brand px-6 py-3 font-semibold text-white shadow-xl shadow-blue-950/55 transition hover:bg-brand-500"
              >
                Start free trial
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-taskly bg-taskly-surface px-6 py-3 font-semibold text-taskly-foreground transition hover:bg-taskly-surface-muted"
              >
                <Play size={16} aria-hidden="true" className="fill-current" />
                View demo
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-taskly bg-taskly-surface p-4"
                >
                  <div className="text-xs text-taskly-muted">{metric.label}</div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-emerald-300">
                    {metric.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-taskly bg-taskly-surface p-4 shadow-xl shadow-slate-950/25 sm:p-6">
            <div className="rounded-2xl border border-taskly bg-taskly-surface-muted p-4 sm:p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Revenue Performance
                  </p>
                  <p className="mt-1 text-xs text-taskly-muted">
                    Last 24h · live refreshed
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  Live
                </span>
              </div>
              <div className="mb-5 h-36 rounded-xl border border-taskly bg-taskly-surface p-4">
                <div className="flex h-full items-end gap-2">
                  {[36, 45, 40, 58, 52, 66, 72, 61, 74, 81, 78, 92].map(
                    (bar, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-500/75"
                        style={{ height: `${bar}%` }}
                        aria-hidden="true"
                      />
                    ),
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-taskly bg-taskly-surface p-3">
                  <p className="text-xs text-taskly-muted">Conversion rate</p>
                  <p className="mt-1 text-lg font-semibold text-white">7.24%</p>
                </div>
                <div className="rounded-xl border border-taskly bg-taskly-surface p-3">
                  <p className="text-xs text-taskly-muted">Avg. response</p>
                  <p className="mt-1 text-lg font-semibold text-white">213ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-taskly bg-taskly-surface/55">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-white">
              Feature highlights built for fast execution
            </h2>
            <p className="mt-3 text-taskly-muted">
              Every screen is designed for clarity: understand the signal,
              assign ownership, and unblock delivery.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-taskly bg-taskly-surface p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-taskly bg-taskly-surface-muted text-brand-500">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-taskly-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Pricing that scales with your team
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-taskly-muted">
            Start fast, grow confidently, and keep advanced controls ready when
            operations get complex.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.tier}
              className={`rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-blue-600/60 bg-blue-900/20 shadow-xl shadow-blue-950/35"
                  : "border-taskly bg-taskly-surface"
              }`}
            >
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-white">{plan.tier}</h3>
                <p className="mt-1 text-sm text-taskly-muted">{plan.summary}</p>
              </div>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period ? (
                  <span className="pb-1 text-sm text-taskly-muted">{plan.period}</span>
                ) : null}
              </div>
              <ul className="space-y-2">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-taskly-foreground">
                    <Check size={16} className="mt-0.5 shrink-0 text-blue-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.tier === "Enterprise" ? "/login" : "/register"}
                className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-taskly-brand text-white hover:bg-brand-500"
                    : "border border-taskly bg-taskly-surface-muted text-taskly-foreground hover:bg-taskly-surface"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-taskly bg-taskly-surface/55">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <p className="mb-4 text-center text-xs font-semibold tracking-[0.12em] text-taskly-muted">
            TRUSTED BY TEAMS WORLDWIDE
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Globe2, label: "Global-first architecture" },
              { icon: BadgeCheck, label: "99.97% uptime track record" },
              { icon: BarChart3, label: "Actionable analytics" },
              { icon: Check, label: "SOC-ready workflows" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-taskly bg-taskly-surface px-4 py-3"
              >
                <Icon size={18} className="text-brand-500" aria-hidden="true" />
                <span className="text-sm font-medium text-taskly-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 Taskly</span>
        <span>Make progress visible.</span>
      </footer>
    </main>
  );
}
