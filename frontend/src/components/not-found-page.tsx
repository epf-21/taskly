import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-taskly-background px-5 py-12 text-taskly-foreground">
      <section className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-xl border border-taskly-strong bg-taskly-surface text-taskly-brand">
          <Compass size={38} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-taskly-brand">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-taskly-foreground sm:text-5xl">
          This page could not be found.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-taskly-muted">
          The page you are looking for does not exist or may have moved to
          another workspace.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            <Home size={17} aria-hidden="true" />
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-taskly-strong bg-taskly-surface px-5 py-3 text-sm font-semibold text-taskly-foreground transition-colors hover:bg-taskly-surface-muted"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
