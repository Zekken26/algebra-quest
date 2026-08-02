import assert from "node:assert/strict";
import test from "node:test";
import { createAssignmentSchema } from "./assignment.validation";

const validAssignment = {
  title: "Linear equations practice",
  sectionId: "section-1",
  isPublished: false,
  questions: [{
    equation: "2x + 3 = 9",
    questionType: "MULTIPLE_CHOICE",
    choices: ["2", "3", "4"],
    correctAnswer: "3",
    explanation: "Subtract 3, then divide by 2.",
    points: 1,
  }],
};

test("accepts a teacher's valid draft assignment", () => {
  const result = createAssignmentSchema.safeParse(validAssignment);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.isPublished, false);
});

test("accepts an explicitly published assignment", () => {
  const result = createAssignmentSchema.safeParse({ ...validAssignment, isPublished: true });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.isPublished, true);
});

test("reports field paths for short titles and incomplete questions", () => {
  const result = createAssignmentSchema.safeParse({
    ...validAssignment,
    title: " ",
    questions: [{ ...validAssignment.questions[0], equation: " ", correctAnswer: " " }],
  });
  assert.equal(result.success, false);
  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path.join("."));
    assert.deepEqual(paths, ["title", "questions.0.equation", "questions.0.correctAnswer"]);
  }
});

test("rejects a due date before the assignment becomes available", () => {
  const result = createAssignmentSchema.safeParse({
    ...validAssignment,
    availableFrom: "2026-08-03T00:00:00.000Z",
    dueDate: "2026-08-02T00:00:00.000Z",
  });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.error.issues[0]?.path.join("."), "dueDate");
});
