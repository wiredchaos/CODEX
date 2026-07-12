export const roles = ['PUBLIC','MEMBER','CONTRIBUTOR','MODERATOR','OPERATOR','ADMIN'] as const;
export type Role = (typeof roles)[number];
const rank: Record<Role, number> = { PUBLIC:0, MEMBER:1, CONTRIBUTOR:2, MODERATOR:3, OPERATOR:4, ADMIN:5 };
export function hasRole(userRoles: Role[] = ['PUBLIC'], required: Role): boolean { return userRoles.some((role) => rank[role] >= rank[required]); }
export function assertRole(userRoles: Role[] | undefined, required: Role): void { if (!hasRole(userRoles ?? ['PUBLIC'], required)) { throw Object.assign(new Error('You do not have permission to perform this action.'), { statusCode: 403, code: 'FORBIDDEN' }); } }
