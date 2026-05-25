import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../../utils/AppError";
import {
  assertActiveEnrollment,
  assertHintTokensAvailable,
  assertQuestionCanBeAnswered,
  assertTeacherOwnsResource,
  canContinueProgress,
} from "./progress.rules";

test("continues only unlocked, unfinished progress with hearts", () => {
  assert.equal(canContinueProgress({ questUnlocked: true, questCompleted: false, heartsRemaining: 2 }), true);
  assert.equal(canContinueProgress({ questUnlocked: true, questCompleted: true, heartsRemaining: 2 }), false);
  assert.equal(canContinueProgress({ questUnlocked: true, questCompleted: false, heartsRemaining: 0 }), false);
});

test("blocks duplicate question answers in the same attempt", () => {
  assert.doesNotThrow(() => assertQuestionCanBeAnswered(null));
  assert.throws(
    () => assertQuestionCanBeAnswered({ answeredAt: new Date("2026-05-14T00:00:00.000Z") }),
    (error) => error instanceof AppError && error.code === "QUESTION_ALREADY_ANSWERED",
  );
});

test("requires hint tokens before using a hint", () => {
  assert.doesNotThrow(() => assertHintTokensAvailable(1));
  assert.throws(
    () => assertHintTokensAvailable(0),
    (error) => error instanceof AppError && error.code === "NO_HINT_TOKENS",
  );
});

test("requires active enrollment for student class access", () => {
  assert.doesNotThrow(() => assertActiveEnrollment({ status: "ACTIVE" }));
  assert.throws(
    () => assertActiveEnrollment({ status: "REMOVED" }),
    (error) => error instanceof AppError && error.statusCode === 403,
  );
});

test("blocks access to another teacher resource", () => {
  assert.doesNotThrow(() => assertTeacherOwnsResource({ teacherId: "teacher-1" }, "teacher-1"));
  assert.throws(
    () => assertTeacherOwnsResource({ teacherId: "teacher-2" }, "teacher-1"),
    (error) => error instanceof AppError && error.statusCode === 403,
  );
});
