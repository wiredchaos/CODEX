import { z } from 'zod';
import type { Role } from '../../policy/src/index.js';
export type AuthIdentity = { id: string; email?: string; displayName?: string; roles: Role[]; provider: 'email' | 'external' | 'anonymous' };
export const sessionRequestSchema = z.object({ email: z.string().email(), displayName: z.string().min(1).optional() });
export interface AuthProvider { createSession(input: z.infer<typeof sessionRequestSchema>): Promise<{ token: string; identity: AuthIdentity }>; verifyToken(token: string): Promise<AuthIdentity | null>; }
export class LocalJwtCompatibleAuthProvider implements AuthProvider {
  async createSession(input: z.infer<typeof sessionRequestSchema>) { const identity: AuthIdentity = { id: `user_${Buffer.from(input.email).toString('hex').slice(0,12)}`, email: input.email, displayName: input.displayName, roles: ['MEMBER'], provider: 'email' }; return { token: Buffer.from(JSON.stringify(identity)).toString('base64url'), identity }; }
  async verifyToken(token: string) { try { return JSON.parse(Buffer.from(token, 'base64url').toString()) as AuthIdentity; } catch { return null; } }
}
