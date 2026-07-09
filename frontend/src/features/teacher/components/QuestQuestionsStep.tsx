import { ArrowDown, ArrowUp, Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadTeacherQuestAsset } from "@/features/teacher/services/teacherService";
import type { QuestQuestionDraft } from "@/features/teacher/components/CreateQuestWizard";
import { MathInput } from "@/shared/components/MathInput";
import { MathRenderer } from "@/shared/components/MathRenderer";

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

function getQuestImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(
    /\/api$/,
    "",
  );
  return `${baseUrl}${url}`;
}

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
  const [uploadingMap, setUploadingMap] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  const triggerUpload = (index: number) => {
    setActiveUploadIndex(index);
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || activeUploadIndex === null) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Quest asset must be a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    const index = activeUploadIndex;
    setUploadingMap((prev) => ({ ...prev, [index]: true }));
    try {
      const imageUrl = await uploadTeacherQuestAsset(file);
      onQuestionChange(index, { imageUrl });
      toast.success(`Question ${index + 1} image uploaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploadingMap((prev) => ({ ...prev, [index]: false }));
      setActiveUploadIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onQuestionChange(index, { imageUrl: "" });
  };

  return (
    <div className="grid gap-5">
      {/* Hidden file input shared across questions */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => void handleUpload(event)}
      />

      {errors.questions ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {errors.questions}
        </div>
      ) : null}

      {questions.map((question, questionIndex) => {
        const hasImage = !!question.imageUrl;
        return (
          <article
            key={question.id}
            className="rounded-2xl border border-primary/15 bg-black/20 p-4"
          >
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
              {/* Question Image Section */}
              <div className="teacher-card p-4 border border-primary/15 bg-black/20 rounded-xl">
                <span className="text-sm font-semibold text-stone-foreground/80 block mb-2">
                  Question Image (Optional)
                </span>
                <p className="text-xs text-stone-foreground/60 mb-4">
                  Upload an image (e.g. a graph, diagram) for this question. If uploaded, text
                  fields below can be left empty.
                </p>

                <div className="flex flex-wrap items-start gap-4">
                  <div className="relative grid h-32 w-48 place-items-center overflow-hidden rounded-xl border border-primary/20 bg-black/25">
                    {hasImage ? (
                      <>
                        <img
                          src={getQuestImageUrl(question.imageUrl)}
                          alt={`Question ${questionIndex + 1} asset`}
                          className="h-full w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemove(questionIndex)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-white hover:bg-destructive/80 transition"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-stone-foreground/50">No image uploaded</span>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn-game text-sm"
                      disabled={uploadingMap[questionIndex]}
                      onClick={() => triggerUpload(questionIndex)}
                    >
                      {uploadingMap[questionIndex] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {uploadingMap[questionIndex]
                        ? "Uploading..."
                        : hasImage
                          ? "Change Image"
                          : "Upload Image"}
                    </button>
                  </div>
                </div>
              </div>

              <label className="grid gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-stone-foreground/80">Equation</span>
                  {hasImage && (
                    <span className="text-xs text-accent/80 font-normal">
                      Optional (Image provided)
                    </span>
                  )}
                </div>
                <MathInput
                  className="teacher-input"
                  value={question.equation}
                  onChange={(value) =>
                    onQuestionChange(questionIndex, { equation: value })
                  }
                  placeholder="2x + 5 = 15"
                />
                {question.equation ? (
                  <div className="mt-2 rounded-xl border border-primary/10 bg-black/20 p-3 text-center">
                    <span className="text-xs font-semibold text-stone-foreground/60 block mb-1">Preview</span>
                    <MathRenderer latex={question.equation} displayMode />
                  </div>
                ) : null}
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
                <span className="text-sm font-semibold text-stone-foreground/80">
                  Correct answer
                </span>
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
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-stone-foreground/80">
                    Explanation
                  </span>
                  {hasImage && (
                    <span className="text-xs text-accent/80 font-normal">
                      Optional (Image provided)
                    </span>
                  )}
                </div>
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
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-stone-foreground/80">
                      Solution Steps
                    </span>
                    {hasImage && (
                      <span className="text-xs text-accent/80 font-normal">
                        Optional (Image provided)
                      </span>
                    )}
                  </div>
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
        );
      })}

      <button type="button" className="btn-game btn-stone w-fit text-sm" onClick={onAdd}>
        <Plus className="h-4 w-4" /> Add Question
      </button>
    </div>
  );
}
