import { ContentManager } from "@/features/teacher/components/ContentManager";
import { AssignmentForm } from "@/features/teacher/components/AssignmentForm";

type AssignmentsTabProps = {
  classId: string;
  onLoad: () => void;
};

export function AssignmentsTab({ classId, onLoad }: AssignmentsTabProps) {
  return (
    <ContentManager
      classId={classId}
      contentType="ASSIGNMENT"
      onRefresh={onLoad}
      FormComponent={AssignmentForm}
    />
  );
}
