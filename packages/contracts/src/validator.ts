import Ajv from "ajv";
import baseSchema from "./event-schema/base-event.v1.json";
import { assertMissingScopesDenied, assertNoXPMappings } from "./firewall/invariants";

type ContractEvent = {
  scopes?: string[];
  operation?: string;
  [key: string]: unknown;
};

const ajv = new Ajv({ strict: true });
const validateBase = ajv.compile(baseSchema);

export function validateEvent(event: ContractEvent): void {
  const valid = validateBase(event);

  if (!valid) {
    throw new Error(JSON.stringify(validateBase.errors));
  }

  assertMissingScopesDenied(event.scopes ?? []);

  if (typeof event.operation === "string") {
    assertNoXPMappings(event.operation);
  }
}
