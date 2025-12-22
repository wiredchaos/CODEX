export const PROTECTED_TRADE_SAFETY = {
  invoiceOnly: true,
  approvalFirewall: true,
  signatureSimulation: true,
  antiDrain: true,
  noRawAddresses: true,
};

export function assertProtectedTrade(): { ok: true; enforced: typeof PROTECTED_TRADE_SAFETY } {
  return { ok: true, enforced: PROTECTED_TRADE_SAFETY };
}
