/**
 * Deterministic canonical JSON serialization.
 *
 * Rules:
 *  - Recursive lexicographic key sort on objects
 *  - Preserve array order
 *  - UTF-8 encoding (native JS string → JSON is UTF-8 safe)
 *  - Reject NaN, Infinity, -Infinity
 *  - Reject undefined (fail closed — do NOT silently drop)
 *  - Reject Date objects (must be ISO strings)
 *
 * Golden vector:
 *   Input:     {"z":1,"a":{"m":2,"b":3},"k":[1,2,3]}
 *   Canonical: {"a":{"b":3,"m":2},"k":[1,2,3],"z":1}
 *   SHA-256:   fdd2a604b797d25928a8badf9f70584b1426903ec04146e2608d5e4f4230486e
 */

export class CanonicalJsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanonicalJsonError";
  }
}

function canonicalize(value: unknown): string {
  if (value === undefined) {
    throw new CanonicalJsonError(
      "undefined is not allowed in canonical JSON (fail closed)",
    );
  }

  if (value === null) {
    return "null";
  }

  if (value instanceof Date) {
    throw new CanonicalJsonError(
      "Date objects are not allowed — use ISO 8601 strings instead",
    );
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      throw new CanonicalJsonError("NaN is not allowed in canonical JSON");
    }
    if (!Number.isFinite(value)) {
      throw new CanonicalJsonError(
        "Infinity/-Infinity is not allowed in canonical JSON",
      );
    }
    return JSON.stringify(value);
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const items = value.map((item, index) => {
      if (item === undefined) {
        throw new CanonicalJsonError(
          `undefined at array index ${index} is not allowed (fail closed)`,
        );
      }
      return canonicalize(item);
    });
    return "[" + items.join(",") + "]";
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const pairs: string[] = [];

    for (const key of sortedKeys) {
      const v = obj[key];
      if (v === undefined) {
        throw new CanonicalJsonError(
          `undefined value for key "${key}" is not allowed (fail closed)`,
        );
      }
      pairs.push(JSON.stringify(key) + ":" + canonicalize(v));
    }

    return "{" + pairs.join(",") + "}";
  }

  throw new CanonicalJsonError(
    `Unsupported type: ${typeof value}`,
  );
}

/**
 * Serialize a value to canonical JSON (deterministic).
 * Throws CanonicalJsonError on invalid input.
 */
export function toCanonicalJson(value: unknown): string {
  return canonicalize(value);
}
