import assert from "node:assert/strict";
import test from "node:test";
import { createPreTestSchema } from "./preTest.validation";

const base = { title: "Pre-test", sectionId: "section-1", isPublished: false };

test("accepts matching pre-tests with complete pairs", () => {
  const result = createPreTestSchema.safeParse({
    ...base,
    questions: [{
      equation: "Match each expression.", questionType: "MATCHING", choices: [],
      correctAnswer: "x=variable", explanation: "", points: 1,
      matchingPairs: [{ left: "x", right: "variable" }], enumerationItems: [],
    }],
  });
  assert.equal(result.success, true);
});

test("rejects matching and enumeration pre-tests without answer data", () => {
  const matching = createPreTestSchema.safeParse({
    ...base,
    questions: [{ equation: "Match", questionType: "MATCHING", choices: [], correctAnswer: "x=y", explanation: "", points: 1, matchingPairs: [], enumerationItems: [] }],
  });
  const enumeration = createPreTestSchema.safeParse({
    ...base,
    questions: [{ equation: "List", questionType: "ENUMERATION", choices: [], correctAnswer: "one", explanation: "", points: 1, enumerationItems: [] }],
  });
  assert.equal(matching.success, false);
  assert.equal(enumeration.success, false);
});
