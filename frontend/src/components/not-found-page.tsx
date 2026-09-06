import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-taskly-background px-5 py-12 text-taskly-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgb(29_78_216_/_14%),transparent_30rem)]" />
      <section className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-taskly bg-taskly-brand-soft text-taskly-brand shadow-2xl shadow-blue-950/40">
          <Compass size={38} strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-taskly-brand">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          This page drifted away.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-taskly-muted">
          The page you are looking for does not exist or may have moved to
          another workspace.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-taskly-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            <Home size={17} />
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-taskly bg-taskly-surface px-5 py-3 text-sm font-semibold text-taskly-foreground transition hover:bg-taskly-surface-muted"
          >
            <ArrowLeft size={17} />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
