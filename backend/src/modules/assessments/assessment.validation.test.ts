import assert from "node:assert/strict";
import test from "node:test";
import { createAssessmentSchema } from "./assessment.validation";

test("accepts explicit draft and published assessments", () => {
  const base = {
    title: "Assessment", sectionId: "section-1", questions: [{
      equation: "x + 1 = 2", questionType: "MULTIPLE_CHOICE", choices: ["1"],
      correctAnswer: "1", explanation: "", points: 1,
    }],
  };
  assert.equal(createAssessmentSchema.safeParse({ ...base, isPublished: false }).success, true);
  assert.equal(createAssessmentSchema.safeParse({ ...base, isPublished: true }).success, true);
});
