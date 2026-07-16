const XP_TOKEN_PATTERN = /convertXPToToken\s*\(/i;

export function assertNoXPMappings(operation: string): void {
  if (XP_TOKEN_PATTERN.test(operation)) {
    throw new Error("XP-to-token mappings are forbidden by firewall policy.");
  }
}

export function assertMissingScopesDenied(scopes: string[]): void {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    throw new Error("Event must include at least one explicit authorization scope.");
  }
}
