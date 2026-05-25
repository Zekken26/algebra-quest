import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { QuestQuestionDraft } from "@/features/teacher/components/CreateQuestWizard";

type QuestQuestionsStepProps = {
  questions: QuestQuestionDraft[];
  errors: Record<string, string>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onQuestionChange: (index: number, patch: Partial<QuestQuestionDraft>) => void;
  onChoiceChange: (questionIndex: number, choiceIndex: number, value: string) => void;
  onSolutionStepChange: (questionIndex: number, stepIndex: number, value: string) => void;
  onAddSolutionStep: (questionIndex: number) => void;
  onRemoveSolutionStep: (questionIndex: number, stepIndex: number) => void;
  onMoveSolutionStep: (questionIndex: number, stepIndex: number, direction: -1 | 1) => void;
};

export function QuestQuestionsStep({
  questions,
  errors,
  onAdd,
  onRemove,
  onQuestionChange,
  onChoiceChange,
  onSolutionStepChange,
  onAddSolutionStep,
  onRemoveSolutionStep,
  onMoveSolutionStep,
}: QuestQuestionsStepProps) {
  return (
    <div className="grid gap-5">
      {errors.questions ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {errors.questions}
        </div>
      ) : null}

      {questions.map((question, questionIndex) => (
        <article key={question.id} className="rounded-2xl border border-primary/15 bg-black/20 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl text-primary">Question {questionIndex + 1}</h3>
            <button
              type="button"
              className="btn-game btn-stone text-xs"
              onClick={() => onRemove(questionIndex)}
              disabled={questions.length === 1}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-foreground/80">Equation</span>
              <input
                className="teacher-input"
                value={question.equation}
                onChange={(event) =>
                  onQuestionChange(questionIndex, { equation: event.target.value })
                }
                placeholder="2x + 5 = 15"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {question.choices.map((choice, choiceIndex) => (
                <label key={choiceIndex} className="grid gap-2">
                  <span className="text-sm font-semibold text-stone-foreground/80">
                    Choice {choiceIndex + 1}
                  </span>
                  <input
                    className="teacher-input"
                    value={choice}
                    onChange={(event) =>
                      onChoiceChange(questionIndex, choiceIndex, event.target.value)
                    }
                    placeholder={choiceIndex === 0 ? "5" : "Answer choice"}
                  />
                </label>
              ))}
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-foreground/80">Correct answer</span>
              <select
                className="teacher-input"
                value={question.correctAnswer}
                onChange={(event) =>
                  onQuestionChange(questionIndex, { correctAnswer: event.target.value })
                }
              >
                <option value="">Select the correct choice</option>
                {question.choices.map((choice, choiceIndex) => (
                  <option key={`${choiceIndex}-${choice}`} value={choice}>
                    {choice || `Choice ${choiceIndex + 1}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-foreground/80">Explanation</span>
              <textarea
                className="teacher-input min-h-24"
                value={question.explanation}
                onChange={(event) =>
                  onQuestionChange(questionIndex, { explanation: event.target.value })
                }
                placeholder="Subtract 5 from both sides, then divide by 2."
              />
            </label>

            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-stone-foreground/80">
                  Solution Steps
                </span>
                <button
                  type="button"
                  className="btn-game btn-stone text-xs"
                  onClick={() => onAddSolutionStep(questionIndex)}
                >
                  <Plus className="h-4 w-4" /> Add Step
                </button>
              </div>
              <div className="grid gap-3">
                {question.solutionSteps.map((step, stepIndex) => (
                  <div
                    key={stepIndex}
                    className="grid gap-2 rounded-xl border border-primary/10 bg-black/20 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor={`${question.id}-step-${stepIndex}`}
                        className="text-sm font-semibold text-primary"
                      >
                        Step {stepIndex + 1}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-primary/15 bg-black/20 text-primary disabled:opacity-40"
                          onClick={() => onMoveSolutionStep(questionIndex, stepIndex, -1)}
                          disabled={stepIndex === 0}
                          aria-label={`Move step ${stepIndex + 1} up`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-primary/15 bg-black/20 text-primary disabled:opacity-40"
                          onClick={() => onMoveSolutionStep(questionIndex, stepIndex, 1)}
                          disabled={stepIndex === question.solutionSteps.length - 1}
                          aria-label={`Move step ${stepIndex + 1} down`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-destructive/20 bg-destructive/10 text-destructive disabled:opacity-40"
                          onClick={() => onRemoveSolutionStep(questionIndex, stepIndex)}
                          disabled={question.solutionSteps.length === 1}
                          aria-label={`Remove step ${stepIndex + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      id={`${question.id}-step-${stepIndex}`}
                      className="teacher-input"
                      value={step}
                      onChange={(event) =>
                        onSolutionStepChange(questionIndex, stepIndex, event.target.value)
                      }
                      placeholder={
                        stepIndex === 0 ? "Subtract 5 from both sides." : "Next solution step"
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}

      <button type="button" className="btn-game btn-stone w-fit text-sm" onClick={onAdd}>
        <Plus className="h-4 w-4" /> Add Question
      </button>
    </div>
  );
}
