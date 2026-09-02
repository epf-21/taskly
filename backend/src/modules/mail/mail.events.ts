export const MAIL_EVENTS = {
  invitationCreated: 'workspace.invitation.created',
  notificationCreated: 'notification.created',
} as const;

export class InvitationCreatedEvent {
  constructor(
    public readonly invitationId: string,
    public readonly workspaceId: string,
    public readonly invitedEmail: string,
    public readonly role: string,
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}
}

export class NotificationCreatedEvent {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly payload: Record<string, unknown>,
  ) {}
}
