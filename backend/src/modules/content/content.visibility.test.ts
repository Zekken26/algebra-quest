import assert from "node:assert/strict";
import test from "node:test";
import { isWithinAvailabilityWindow } from "./content.visibility";

const now = new Date("2026-08-01T12:00:00.000Z");

test("shows content with no availability limits", () => {
  assert.equal(isWithinAvailabilityWindow({ availableFrom: null, availableTo: null }, now), true);
});

test("hides scheduled content until its availability date", () => {
  assert.equal(
    isWithinAvailabilityWindow({ availableFrom: new Date("2026-08-02T00:00:00.000Z"), availableTo: null }, now),
    false,
  );
});

test("hides expired content after its availability date", () => {
  assert.equal(
    isWithinAvailabilityWindow({ availableFrom: null, availableTo: new Date("2026-08-01T11:59:59.000Z") }, now),
    false,
  );
});
