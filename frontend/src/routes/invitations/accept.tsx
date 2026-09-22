import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, MailCheck } from "lucide-react";
import { z } from "zod";
import { Button, Card } from "@/components/ui";
import { getAccessToken } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  pendingInvitationTokenKey,
  useAcceptInvitation,
} from "@/features/workspaces/hooks/use-accept-invitation";

export const Route = createFileRoute("/invitations/accept")({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const acceptInvitation = useAcceptInvitation();
  const [completedWorkspace, setCompletedWorkspace] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const storedToken =
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem(pendingInvitationTokenKey);
  const invitationToken = token ?? storedToken;
  const isAuthenticated = Boolean(getAccessToken());

  useEffect(() => {
    if (token) {
      sessionStorage.setItem(pendingInvitationTokenKey, token);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated && invitationToken) {
      sessionStorage.setItem(pendingInvitationTokenKey, invitationToken);
    }
  }, [invitationToken, isAuthenticated]);

  const handleAccept = async () => {
    if (!invitationToken) {
      setErrorMessage("The invitation link is missing its token.");
      return;
    }

    setErrorMessage(null);
    try {
      const result = await acceptInvitation.mutateAsync(invitationToken);
      sessionStorage.removeItem(pendingInvitationTokenKey);
      setCompletedWorkspace(result.workspace.name);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to accept this invitation. It may be expired or belong to another email.",
        ),
      );
    }
  };

  if (!invitationToken) {
    return (
      <InvitationLayout>
        <h1 className="text-2xl font-bold text-taskly-foreground">
          Invalid invitation link
        </h1>
        <p className="mt-2 text-sm text-taskly-muted">
          This link does not contain a valid invitation token.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go to Taskly</Button>
        </Link>
      </InvitationLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <InvitationLayout>
        <MailCheck className="mx-auto text-taskly-brand" size={42} />
        <h1 className="mt-5 text-2xl font-bold text-taskly-foreground">
          You have been invited
        </h1>
        <p className="mt-2 text-sm text-taskly-muted">
          Sign in with the email that received this invitation to join the
          workspace.
        </p>
        <Link
          to="/login"
          search={{ redirect: "/invitations/accept" }}
          className="mt-6 inline-block"
        >
          <Button>Sign in to accept</Button>
        </Link>
        <p className="mt-4 text-xs text-taskly-muted">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-taskly-brand hover:underline">
            Create one first
          </Link>
          .
        </p>
      </InvitationLayout>
    );
  }

  if (completedWorkspace) {
    return (
      <InvitationLayout>
        <CheckCircle2 className="mx-auto text-taskly-success" size={48} />
        <h1 className="mt-5 text-2xl font-bold text-taskly-foreground">
          Invitation accepted
        </h1>
        <p className="mt-2 text-sm text-taskly-muted">
          You are now a member of {completedWorkspace}.
        </p>
        <Button className="mt-6" onClick={() => navigate({ to: "/dashboard" })}>
          Open dashboard
        </Button>
      </InvitationLayout>
    );
  }

  return (
    <InvitationLayout>
      <MailCheck className="mx-auto text-taskly-brand" size={42} />
      <h1 className="mt-5 text-2xl font-bold text-taskly-foreground">
        Accept workspace invitation
      </h1>
      <p className="mt-2 text-sm text-taskly-muted">
        Confirm that you want to join this workspace with your current account.
      </p>
      {errorMessage && (
        <p role="alert" className="mt-5 text-sm text-taskly-danger">
          {errorMessage}
        </p>
      )}
      <Button
        className="mt-6"
        disabled={acceptInvitation.isPending}
        onClick={() => void handleAccept()}
      >
        {acceptInvitation.isPending ? "Accepting..." : "Accept invitation"}
      </Button>
    </InvitationLayout>
  );
}

function InvitationLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-taskly-background px-4 py-10">
      <Card className="w-full max-w-md p-6 text-center sm:p-8">
        <Link to="/" className="text-lg font-bold text-taskly-foreground">
          Taskly
        </Link>
        {children}
      </Card>
    </main>
  );
}
