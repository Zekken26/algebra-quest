import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../utils/AppError";
import { requireRole } from "./auth.middleware";

function runRoleGuard(role: "STUDENT" | "TEACHER", allowed: Array<"STUDENT" | "TEACHER">) {
  const guard = requireRole(...allowed);
  let nextError: unknown;
  guard({ user: { sub: "user-1", email: "user@example.com", role } } as never, {} as never, (error?: unknown) => {
    nextError = error;
  });
  return nextError;
}

test("permission middleware allows matching teacher and student roles", () => {
  assert.equal(runRoleGuard("TEACHER", ["TEACHER"]), undefined);
  assert.equal(runRoleGuard("STUDENT", ["STUDENT"]), undefined);
});

test("permission middleware returns forbidden for the wrong role", () => {
  const error = runRoleGuard("STUDENT", ["TEACHER"]);

  assert.ok(error instanceof AppError);
  assert.equal(error.statusCode, 403);
  assert.equal(error.code, "FORBIDDEN");
});
