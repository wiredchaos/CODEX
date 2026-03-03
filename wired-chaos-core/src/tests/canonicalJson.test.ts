/**
 * Unit test for canonical JSON + golden vector.
 * No external dependencies — runs standalone with tsx.
 */

import { toCanonicalJson, CanonicalJsonError } from "../services/canonicalJson.js";
import { sha256 } from "../services/hashService.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

function assertThrows(fn: () => void, label: string): void {
  try {
    fn();
    console.error(`  ✗ ${label} (did not throw)`);
    failed++;
  } catch {
    console.log(`  ✓ ${label}`);
    passed++;
  }
}

console.log("=== Canonical JSON tests ===\n");

// ── Golden vector ────────────────────────────────────────────────
console.log("Golden vector:");
const input = { z: 1, a: { m: 2, b: 3 }, k: [1, 2, 3] };
const canonical = toCanonicalJson(input);
const expectedCanonical = '{"a":{"b":3,"m":2},"k":[1,2,3],"z":1}';
const expectedHash = "fdd2a604b797d25928a8badf9f70584b1426903ec04146e2608d5e4f4230486e";

assert(canonical === expectedCanonical, `canonical output: ${canonical}`);
assert(sha256(canonical) === expectedHash, `SHA-256: ${sha256(canonical)}`);

// ── Key sorting ──────────────────────────────────────────────────
console.log("\nKey sorting:");
assert(
  toCanonicalJson({ c: 1, a: 2, b: 3 }) === '{"a":2,"b":3,"c":1}',
  "top-level keys sorted",
);
assert(
  toCanonicalJson({ x: { z: 1, a: 2 } }) === '{"x":{"a":2,"z":1}}',
  "nested keys sorted",
);

// ── Array order preserved ────────────────────────────────────────
console.log("\nArray order:");
assert(
  toCanonicalJson([3, 1, 2]) === "[3,1,2]",
  "array order preserved",
);

// ── Primitives ───────────────────────────────────────────────────
console.log("\nPrimitives:");
assert(toCanonicalJson(null) === "null", "null");
assert(toCanonicalJson(true) === "true", "true");
assert(toCanonicalJson(false) === "false", "false");
assert(toCanonicalJson(42) === "42", "number");
assert(toCanonicalJson("hello") === '"hello"', "string");

// ── Rejection: NaN ───────────────────────────────────────────────
console.log("\nRejection:");
assertThrows(() => toCanonicalJson(NaN), "NaN rejected");
assertThrows(() => toCanonicalJson(Infinity), "Infinity rejected");
assertThrows(() => toCanonicalJson(-Infinity), "-Infinity rejected");
assertThrows(() => toCanonicalJson(undefined), "undefined rejected");
assertThrows(() => toCanonicalJson(new Date()), "Date object rejected");
assertThrows(
  () => toCanonicalJson({ a: undefined }),
  "undefined in object rejected",
);
assertThrows(
  () => toCanonicalJson({ a: [undefined] }),
  "undefined in array rejected",
);
assertThrows(
  () => toCanonicalJson({ a: NaN }),
  "NaN in object rejected",
);
assertThrows(
  () => toCanonicalJson({ a: new Date() }),
  "Date in nested object rejected",
);

// ── Summary ──────────────────────────────────────────────────────
console.log(`\n--- ${passed} passed, ${failed} failed ---`);
if (failed > 0) process.exitCode = 1;
