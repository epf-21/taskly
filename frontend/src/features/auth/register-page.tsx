import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button, Card, Input, InputMessageErrors } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api/errors";
import { defaultValues, RegisterSchema } from "./dto/register-dto";
import { useRegister } from "./hook/use-register";
import { pendingInvitationTokenKey } from "@/features/workspaces/hooks/use-accept-invitation";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useRegister();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: RegisterSchema },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        await register.mutateAsync(value);
        toast.success("Account created");
        const pendingInvitation = sessionStorage.getItem(
          pendingInvitationTokenKey,
        );
        if (pendingInvitation) {
          await navigate({ to: "/invitations/accept" });
        } else {
          await navigate({ to: "/dashboard" });
        }
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to create your account. Check details and try again.",
          ),
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
          Create your account
        </h1>
        <p className="mt-2 text-sm text-taskly-muted">
          Start organizing your work today.
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
          <form.Field
            name="fullName"
            children={(field) => {
              const invalid = !field.state.meta.isValid;
              return (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={field.name}
                    className="flex items-center gap-2 text-sm font-medium text-taskly-foreground"
                  >
                    <UserRound
                      className="h-4 w-4 text-taskly-muted"
                      size={16}
                      aria-hidden="true"
                    />
                    <span>Full name</span>
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Cooper"
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
                    autoComplete="new-password"
                    placeholder="Create a strong password"
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
                {isSubmitting ? "Please wait..." : "Create account"}
              </Button>
            )}
          />
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-taskly-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-taskly-brand hover:text-brand-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
