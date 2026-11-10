import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { LockKeyhole, Mail } from "lucide-react";
import { Button, Card, Input, InputMessageErrors } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api/errors";
import { LoginSchema, defaultValues } from "./dto/login-dto";
import { useLogin } from "./hook/use-login";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/_public/login" });
  const login = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: LoginSchema },

    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        await login.mutateAsync(value);
        toast.success("Welcome back");
        if (redirect === "/invitations/accept") {
          await navigate({ to: "/invitations/accept" });
        } else {
          await navigate({ to: "/dashboard" });
        }
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Invalid email or password."),
        );
      }
    },
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/40 bg-brand-600 text-lg font-bold text-white">
            T
          </span>
          <span className="text-xl font-bold text-taskly-foreground">Taskly</span>
        </Link>
        <h1 className="mt-8 text-2xl font-bold text-taskly-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-taskly-muted">
          Sign in to continue to your workspace.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="email"
            children={(field) => {
              const invalid = !field.state.meta.isValid;
              return (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={field.name}
                    className="flex items-center gap-2 text-sm font-medium text-taskly-foreground"
                  >
                    <Mail className="h-4 w-4 text-taskly-muted" aria-hidden="true" />
                    <span>Email</span>
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-required="true"
                    aria-invalid={invalid}
                    aria-describedby={invalid ? `${field.name}-error` : undefined}
                  />
                  {invalid && (
                    <InputMessageErrors
                      id={`${field.name}-error`}
                      message={field.state.meta.errors
                        .map((e) => e?.message)
                        .join(" ")}
                    />
                  )}
                </div>
              );
            }}
          />
          <form.Field
            name="password"
            children={(field) => {
              const invalid = !field.state.meta.isValid;
              return (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={field.name}
                    className="flex items-center gap-2 text-sm font-medium text-taskly-foreground"
                  >
                    <LockKeyhole
                      className="h-4 w-4 text-taskly-muted"
                      aria-hidden="true"
                    />
                    <span>Password</span>
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-required="true"
                    aria-invalid={invalid}
                    aria-describedby={invalid ? `${field.name}-error` : undefined}
                  />
                  {invalid && (
                    <InputMessageErrors
                      id={`${field.name}-error`}
                      message={field.state.meta.errors
                        .map((e) => e?.message)
                        .join(" ")}
                    />
                  )}
                </div>
              );
            }}
          />
          {errorMessage && (
            <p role="alert" className="text-sm text-taskly-danger">
              {errorMessage}
            </p>
          )}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isSubmitting ? "Please wait..." : "Sign in"}
              </Button>
            )}
          />
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-taskly-muted">
        New to Taskly?{" "}
        <Link
          to="/register"
          className="font-medium text-taskly-brand hover:text-brand-500"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};
