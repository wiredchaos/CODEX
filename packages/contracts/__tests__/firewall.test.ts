import { assertMissingScopesDenied, assertNoXPMappings } from "../src/firewall/invariants";

describe("Firewall invariants", () => {
  test("blocks XP token mapping", () => {
    expect(() => assertNoXPMappings("convertXPToToken()")).toThrow();
  });

  test("blocks missing scopes", () => {
    expect(() => assertMissingScopesDenied([])).toThrow();
  });
});
