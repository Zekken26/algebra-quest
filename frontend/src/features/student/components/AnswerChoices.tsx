import type { QuizStatus } from "@/features/student/types/student.types";

type AnswerChoicesProps = {
  choices: string[];
  picked: string | null;
  status: QuizStatus;
  disabled?: boolean;
  onChoose: (choice: string) => void;
};

export function AnswerChoices({
  choices,
  picked,
  status,
  disabled = false,
  onChoose,
}: AnswerChoicesProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice) => {
        const state =
          picked === choice && status === "correct"
            ? "correct"
            : picked === choice && status === "wrong"
              ? "wrong"
              : undefined;

        return (
          <button
            key={choice}
            data-state={state}
            disabled={disabled || status !== "idle"}
            onClick={() => onChoose(choice)}
            className="answer-card"
          >
            x = {choice}
          </button>
        );
      })}
    </div>
  );
}
