import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GameQuestionBuilder } from "@/features/teacher/components/GameQuestionBuilder";
import { ModuleEditor } from "@/features/teacher/components/ModuleEditor";
import { QuizBuilder } from "@/features/teacher/components/QuizBuilder";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import {
  addQuestionToQuest,
  deleteTeacherQuestion,
  deleteTeacherQuest,
  fetchTeacherModules,
  fetchTeacherQuests,
  fetchTeacherSections,
  updateTeacherQuestion,
  updateTeacherQuest,
  type TeacherQuestion,
  type TeacherQuest,
} from "@/features/teacher/services/teacherService";
import type { TeacherModule } from "@/features/teacher/types/teacher.types";

export function ModuleBuilderPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<TeacherModule[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [editingModule, setEditingModule] = useState<TeacherModule | null>(null);
  const [quests, setQuests] = useState<TeacherQuest[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<TeacherQuestion | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingModule, setDeletingModule] = useState<TeacherModule | null>(null);

  const load = async () => {
    const [nextModules, sections, nextQuests] = await Promise.all([
      fetchTeacherModules(),
      fetchTeacherSections(),
      fetchTeacherQuests(),
    ]);
    setModules(nextModules);
    setQuests(nextQuests);
    setSectionId((current) => current || sections[0]?.id || "");
    setSelectedModuleId((current) => current || nextModules[0]?.id || "");
  };

  useEffect(() => {
    void load().catch((error) =>
      toast.error(error instanceof Error ? error.message : "Unable to load quests."),
    );
  }, []);

  const createQuest = () => {
    if (!sectionId) {
      toast.error("You need to create a section first.");
      return;
    }
    navigate({ to: "/teacher/quests/create" });
  };

  const openEditQuest = (module: TeacherModule) => {
    setEditingModule(module);
    setEditTitle(module.title);
  };

  const editQuest = async () => {
    if (!editingModule) return;
    const title = editTitle.trim();
    if (!title) {
      toast.error("Quest title is required.");
      return;
    }
    try {
      await updateTeacherQuest(editingModule.id, {
        title,
        topic: editingModule.topic,
        worldName: title,
        difficulty: "Easy",
      });
      toast.success("Quest updated.");
      setEditingModule(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update quest.");
    }
  };

  const togglePublish = async (module: TeacherModule) => {
    try {
      await updateTeacherQuest(module.id, { isPublished: module.status !== "published" });
      toast.success(module.status === "published" ? "Quest unpublished." : "Quest published.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update publish status.");
    }
  };

  const deleteQuest = async () => {
    if (!deletingModule) return;
    try {
      await deleteTeacherQuest(deletingModule.id);
      toast.success("Quest deleted.");
      setDeletingModule(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete quest.");
    }
  };

  const addQuestion = async (question: Parameters<typeof addQuestionToQuest>[1]) => {
    if (!selectedModuleId) {
      toast.error("Select a quest first.");
      return;
    }
    if (
      !question.equation ||
      question.choices.some((choice) => !choice) ||
      !question.correctAnswer
    ) {
      toast.error("Complete the question and all choices first.");
      return;
    }
    try {
      await addQuestionToQuest(selectedModuleId, question);
      toast.success("Question added.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add question.");
    }
  };

  const selectedQuest = quests.find((quest) => quest.id === selectedModuleId);

  const saveQuestion = async (question: TeacherQuestion) => {
    try {
      await updateTeacherQuestion(question.id, {
        equation: question.equation,
        choices: question.choices,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        solutionSteps: question.solutionSteps,
        difficulty: question.difficulty,
      });
      toast.success("Question updated.");
      setEditingQuestion(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update question.");
    }
  };

  const removeQuestion = async (question: TeacherQuestion) => {
    try {
      await deleteTeacherQuestion(question.id);
      toast.success("Question deleted.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete question.");
    }
  };

  return (
    <div>
      <TeacherHeader
        title="Module Builder"
        subtitle="Author quest guides, quiz checks, and game questions before publishing to classes."
        actionLabel="Create Quest"
        onAction={createQuest}
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ModuleEditor
          modules={modules}
          onCreate={createQuest}
          onEdit={openEditQuest}
          onDelete={setDeletingModule}
          onTogglePublish={togglePublish}
          onSelect={(module) => {
            setSelectedModuleId(module.id);
            toast.success(`${module.title} selected.`);
          }}
          selectedModuleId={selectedModuleId}
        />
        <div className="space-y-6">
          <QuizBuilder disabled={!selectedModuleId} onAddQuestion={addQuestion} />
          <GameQuestionBuilder disabled={!selectedModuleId} onAddQuestion={addQuestion} />
          <section className="teacher-card p-5">
            <h2 className="font-display text-xl text-primary">Question Editor</h2>
            <p className="mt-1 text-sm text-stone-foreground/70">
              {selectedQuest ? selectedQuest.title : "Select a quest to edit its questions."}
            </p>
            <div className="mt-4 grid gap-3">
              {selectedQuest?.questions?.length ? (
                selectedQuest.questions.map((question) => (
                  <article
                    key={question.id}
                    className="rounded-2xl border border-primary/15 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary">{question.equation}</p>
                        <p className="mt-1 text-sm text-stone-foreground/70">
                          Answer: {question.correctAnswer}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-game btn-stone text-xs"
                          onClick={() => setEditingQuestion(question)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-game text-xs"
                          onClick={() => void removeQuestion(question)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-stone-foreground/70">No questions yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
      {editingModule ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Edit Quest</h2>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-stone-foreground/70">Quest title</span>
              <input
                className="teacher-input"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setEditingModule(null)}
              >
                Cancel
              </button>
              <button type="button" className="btn-game text-sm" onClick={() => void editQuest()}>
                Save
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {deletingModule ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Delete Quest</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Delete {deletingModule.title}?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setDeletingModule(null)}
              >
                Cancel
              </button>
              <button type="button" className="btn-game text-sm" onClick={() => void deleteQuest()}>
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {editingQuestion ? (
        <QuestionEditorModal
          question={editingQuestion}
          onCancel={() => setEditingQuestion(null)}
          onSave={(question) => void saveQuestion(question)}
        />
      ) : null}
    </div>
  );
}

function QuestionEditorModal({
  question,
  onCancel,
  onSave,
}: {
  question: TeacherQuestion;
  onCancel: () => void;
  onSave: (question: TeacherQuestion) => void;
}) {
  const [draft, setDraft] = useState({
    ...question,
    choicesText: question.choices.join("\n"),
    solutionStepsText: question.solutionSteps.join("\n"),
  });

  const save = () => {
    const choices = draft.choicesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const solutionSteps = draft.solutionStepsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    onSave({ ...draft, choices, solutionSteps });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 px-4 py-8">
      <section className="teacher-card w-full max-w-2xl p-5">
        <h2 className="font-display text-xl text-primary">Edit Question</h2>
        <div className="mt-4 grid gap-3">
          <input
            className="teacher-input"
            value={draft.equation}
            onChange={(event) =>
              setDraft((current) => ({ ...current, equation: event.target.value }))
            }
          />
          <textarea
            className="teacher-input min-h-28"
            value={draft.choicesText}
            onChange={(event) =>
              setDraft((current) => ({ ...current, choicesText: event.target.value }))
            }
          />
          <input
            className="teacher-input"
            value={draft.correctAnswer}
            onChange={(event) =>
              setDraft((current) => ({ ...current, correctAnswer: event.target.value }))
            }
          />
          <textarea
            className="teacher-input min-h-24"
            value={draft.explanation}
            onChange={(event) =>
              setDraft((current) => ({ ...current, explanation: event.target.value }))
            }
          />
          <textarea
            className="teacher-input min-h-28"
            value={draft.solutionStepsText}
            onChange={(event) =>
              setDraft((current) => ({ ...current, solutionStepsText: event.target.value }))
            }
          />
          <input
            className="teacher-input"
            value={draft.difficulty}
            onChange={(event) =>
              setDraft((current) => ({ ...current, difficulty: event.target.value }))
            }
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="btn-game btn-stone text-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-game text-sm" onClick={save}>
            Save Question
          </button>
        </div>
      </section>
    </div>
  );
}
