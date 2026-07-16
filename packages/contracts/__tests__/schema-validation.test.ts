import { validateEvent } from "../src/validator";
import validEvents from "../src/test-vectors/valid-events.json";
import invalidEvents from "../src/test-vectors/invalid-events.json";

describe("Schema validation", () => {
  test("valid events pass", () => {
    validEvents.forEach((event) => {
      expect(() => validateEvent(event)).not.toThrow();
    });
  });

  test("invalid events fail", () => {
    invalidEvents.forEach((event) => {
      expect(() => validateEvent(event)).toThrow();
    });
  });
});
