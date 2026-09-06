import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { LoginSchema, defaultValues } from "./dto/login-dto";
import { useLogin } from "./hook/use-login";

export const LoginPage = () => {
  const navigate = useNavigate();
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
        await navigate({ to: "/dashboard" });
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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-taskly-brand text-lg font-bold">
            T
          </span>
          <span className="text-xl font-bold text-white">Taskly</span>
        </Link>
        <h1 className="mt-8 text-2xl font-bold text-white">Welcome back</h1>
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
            void form.handleSubmit();
          }}
        >
          <form.Field name="email">
            {(field) => (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">
                  Email
                </span>
                <span className="relative block">
                  <Mail
                    className="absolute left-3 top-2.5 text-slate-500"
                    size={17}
                  />
                  <Input
                    required
                    type="email"
                    autoComplete="email"
                    className="pl-10"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </span>
              </label>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">
                  Password
                </span>
                <span className="relative block">
                  <LockKeyhole
                    className="absolute left-3 top-2.5 text-slate-500"
                    size={17}
                  />
                  <Input
                    required
                    minLength={8}
                    type="password"
                    autoComplete="current-password"
                    className="pl-10"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </span>
              </label>
            )}
          </form.Field>
          {errorMessage && (
            <p role="alert" className="text-sm text-red-300">
              {errorMessage}
            </p>
          )}
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : "Sign in"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-slate-500">
        New to Taskly?{" "}
        <Link
          to="/register"
          className="font-medium text-blue-400 hover:text-blue-300"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};
