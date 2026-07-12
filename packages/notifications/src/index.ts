export type NotificationChannel = 'email' | 'discord' | 'telegram' | 'x' | 'in-app';
export interface NotificationProvider { channel: NotificationChannel; send(message: { to: string; subject?: string; body: string }): Promise<{ queued: boolean; providerMessageId?: string }>; }
export class StubNotificationProvider implements NotificationProvider { constructor(public channel: NotificationChannel) {} async send() { return { queued: true, providerMessageId: `stub-${this.channel}` }; } }
