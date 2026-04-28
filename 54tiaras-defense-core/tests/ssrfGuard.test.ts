import { describe, expect, it } from "vitest";
import { assessDestinationUrl } from "../src/services/webhook/ssrfGuard.js";

describe("ssrfGuard", () => {
  it("blocks loopback and private IP destinations", async () => {
    const a = await assessDestinationUrl("http://127.0.0.1:8080/hook");
    expect(a.allowed).toBe(false);
    expect(a.reasons.join(" ")).toMatch(/loopback|private/i);

    const b = await assessDestinationUrl("http://10.0.0.5/hook");
    expect(b.allowed).toBe(false);
  });

  it("blocks metadata endpoints", async () => {
    const r = await assessDestinationUrl("http://169.254.169.254/latest/meta-data/");
    expect(r.allowed).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/metadata/i);
  });
});

