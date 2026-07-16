import { ContentManager } from "@/features/teacher/components/ContentManager";
import { AssignmentForm } from "@/features/teacher/components/AssignmentForm";

type PreTestsTabProps = {
  classId: string;
  onLoad: () => void;
};

export function PreTestsTab({ classId, onLoad }: PreTestsTabProps) {
  return (
    <ContentManager
      classId={classId}
      contentType="PRETEST"
      onRefresh={onLoad}
      FormComponent={AssignmentForm}
    />
  );
}
