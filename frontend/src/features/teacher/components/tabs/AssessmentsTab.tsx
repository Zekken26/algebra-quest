import { ContentManager } from "@/features/teacher/components/ContentManager";
import { AssignmentForm } from "@/features/teacher/components/AssignmentForm";

type AssessmentsTabProps = {
  classId: string;
  onLoad: () => void;
};

export function AssessmentsTab({ classId, onLoad }: AssessmentsTabProps) {
  return (
    <ContentManager
      classId={classId}
      contentType="ASSESSMENT"
      onRefresh={onLoad}
      FormComponent={AssignmentForm}
    />
  );
}
