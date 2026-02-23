export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = res.headers.get("content-type") ?? "";

  // Read as text first so we can surface good errors when the server returns HTML.
  const raw = await res.text();

  if (!res.ok) {
    const head = raw.slice(0, 80).replace(/\s+/g, " ").trim();
    throw new Error(
      `Request failed (${res.status}). Expected JSON but got: ${head || res.statusText}`
    );
  }

  // Try parse even if content-type is wrong (some deployments mislabel JSON).
  try {
    return JSON.parse(raw) as T;
  } catch {
    const head = raw.slice(0, 80).replace(/\s+/g, " ").trim();

    // Most common: Vercel / SPA fallback serving index.html.
    if (head.toLowerCase().startsWith("<!doctype") || head.toLowerCase().startsWith("<html")) {
      throw new Error(
        `Relay returned HTML (SPA fallback) instead of JSON. Your Relay Base URL/route is wrong for this deployment.`
      );
    }

    throw new Error(
      `Invalid JSON response (content-type: ${contentType || "unknown"}). First bytes: ${head}`
    );
  }
}
