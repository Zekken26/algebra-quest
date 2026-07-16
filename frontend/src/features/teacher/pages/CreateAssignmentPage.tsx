import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { AssignmentBuilder } from "@/features/teacher/components/AssignmentBuilder";

export function CreateAssignmentPage() {
  return (
    <div>
      <TeacherHeader
        title="Assignments"
        subtitle="Create and manage assignments for your classes."
      />
      <AssignmentBuilder />
    </div>
  );
}
