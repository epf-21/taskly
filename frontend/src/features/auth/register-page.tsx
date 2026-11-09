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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-800/55 bg-taskly-brand text-lg font-bold shadow-lg shadow-blue-950/45">
            T
          </span>
          <span className="text-xl font-bold text-white">Taskly</span>
        </Link>
        <h1 className="mt-8 text-2xl font-bold text-white">
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
            children={(field) => (
              <div className="flex flex-col gap-2 space-y-2">
                <label
                  htmlFor={field.name}
                  className="flex items-center gap-2 text-sm font-medium text-taskly-foreground"
                >
                  <UserRound className="h-5 w-5 text-taskly-muted" size={17} />
                  <span>Full Name</span>
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  aria-required="true"
                />
                {!field.state.meta.isValid && (
                  <InputMessageErrors
                    message={field.state.meta.errors
                      .map((e) => e?.message)
                      .join(" ")}
                  />
                )}
              </div>
            )}
          />
          <form.Field
            name="email"
            children={(field) => (
              <div className="flex flex-col gap-2 space-y-2">
                <label
                  htmlFor={field.name}
                  className="flex items-center gap-2 text-sm font-medium text-taskly-foreground"
                >
                  <Mail className="h-5 w-5 text-taskly-muted" />
                  <span>Email</span>
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  type="text"
                  placeholder="Enter your email address"
                  aria-required="true"
                />
                {!field.state.meta.isValid && (
                  <InputMessageErrors
                    message={field.state.meta.errors
                      .map((e) => e?.message)
                      .join(" ")}
                  />
                )}
              </div>
            )}
          />
          <form.Field
            name="password"
            children={(field) => (
              <div className="flex flex-col gap-2 space-y-2">
                <label
                  htmlFor={field.name}
                  className="flex items-center gap-2 text-sm font-medium text-taskly-foreground"
                >
                  <LockKeyhole className="h-5 w-5 text-taskly-muted" />
                  <span>Password</span>
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  aria-required="true"
                />
                {!field.state.meta.isValid && (
                  <InputMessageErrors
                    message={field.state.meta.errors
                      .map((e) => e?.message)
                      .join("")}
                  />
                )}
              </div>
            )}
          />
          {errorMessage && (
            <p role="alert" className="text-sm text-red-300">
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
          className="font-medium text-blue-300 hover:text-blue-200"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
