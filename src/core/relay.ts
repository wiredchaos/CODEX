const RELAY_BASE = String(import.meta.env.VITE_RELAY_URL || "").replace(/\/$/, "");
const APP_ID = String(import.meta.env.VITE_RELAY_APP_ID || "").trim();

// Fail-fast in production builds: do not ship half-configured deployments.
if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_RELAY_URL) {
    throw new Error("Relay URL must be defined at build time (VITE_RELAY_URL).");
  }
  if (!import.meta.env.VITE_RELAY_APP_ID) {
    throw new Error("Relay App ID must be defined at build time (VITE_RELAY_APP_ID).");
  }
}

export function isRelayConfigured() {
  return Boolean(RELAY_BASE) && Boolean(APP_ID);
}

export function getRelayBase() {
  if (!RELAY_BASE) {
    throw new Error("VITE_RELAY_URL is not defined at build time.");
  }
  return RELAY_BASE;
}

export function getAppId() {
  if (!APP_ID) {
    throw new Error("VITE_RELAY_APP_ID is not defined at build time.");
  }
  return APP_ID;
}

export function relayUrl(path: string) {
  return `${getRelayBase()}${path}`;
}

export function getBuildHash() {
  // Recommended: set VITE_BUILD_TS (or VITE_BUILD_ID) in CI.
  const stamp = String(import.meta.env.VITE_BUILD_TS || import.meta.env.VITE_BUILD_ID || "");
  return `${import.meta.env.MODE}-${stamp || "unknown"}`;
}
