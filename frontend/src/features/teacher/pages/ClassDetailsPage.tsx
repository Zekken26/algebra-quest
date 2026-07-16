import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchTeacherClassDetails,
  type TeacherClassDetails,
} from "@/features/teacher/services/teacherService";
import { ClassNavBar, type ClassNavTab } from "@/shared/components/ClassNavBar";
import { Eye, Users, BookOpenText, Swords, FileText, BookOpen, Trophy, BarChart3, Settings } from "lucide-react";
import { OverviewTab } from "@/features/teacher/components/tabs/OverviewTab";
import { StudentsTab } from "@/features/teacher/components/tabs/StudentsTab";
import { GuidesTab } from "@/features/teacher/components/tabs/GuidesTab";
import { QuestsTab } from "@/features/teacher/components/tabs/QuestsTab";
import { AssignmentsTab } from "@/features/teacher/components/tabs/AssignmentsTab";
import { PreTestsTab } from "@/features/teacher/components/tabs/PreTestsTab";
import { AssessmentsTab } from "@/features/teacher/components/tabs/AssessmentsTab";
import { GradesTab } from "@/features/teacher/components/tabs/GradesTab";
import { SettingsTab } from "@/features/teacher/components/tabs/SettingsTab";

const TEACHER_TABS: ClassNavTab[] = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "students", label: "Students", icon: Users },
  { id: "guides", label: "Guides", icon: BookOpenText },
  { id: "quests", label: "Quests", icon: Swords },
  { id: "assignments", label: "Assignments", icon: FileText },
  { id: "pretests", label: "Pre-Tests", icon: BookOpen },
  { id: "assessments", label: "Assessments", icon: Trophy },
  { id: "grades", label: "Grades", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

type ClassDetailsPageProps = {
  classId: string;
};

export function ClassDetailsPage({ classId }: ClassDetailsPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [details, setDetails] = useState<TeacherClassDetails | null>(null);

  const load = async () => {
    try {
      const nextDetails = await fetchTeacherClassDetails(classId);
      setDetails(nextDetails);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load class details.");
    }
  };

  useEffect(() => {
    void load();
  }, [classId]);

  const currentClassSection = details
    ? { id: details.classInfo.id, name: details.classInfo.name, code: details.classInfo.code }
    : null;

  const studentsLength = details?.students.length ?? 0;

  const exportCsv = () => {
    if (!details || studentsLength === 0) { toast.error("No students to export."); return; }
    const headers = [
      "Name", "Email", "XP", "Coins", "Grade",
      "Accuracy (%)", "Completion (%)", "Status", "Current Quest", "Last Active",
    ];
    const rows = details.students.map((s) =>
      [
        `"${s.name.replace(/"/g, '""')}"`,
        s.email ?? "",
        s.xp ?? 0,
        s.coins ?? 0,
        s.grade ?? "",
        Math.round(s.progressSummary?.accuracy ?? 0),
        Math.round(s.progressSummary?.completionProgress ?? 0),
        s.status,
        `"${(s.currentQuest?.title ?? "").replace(/"/g, '""')}"`,
        (s as any).lastLoginAt ?? "",
      ].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${details.classInfo.name ?? "class"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Student data exported.");
  };

  return (
    <div>
      <ClassNavBar tabs={TEACHER_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" ? (
        <OverviewTab
          details={details}
          classId={classId}
          currentClassSection={currentClassSection}
          onLoad={() => void load()}
          onExportCsv={exportCsv}
          studentsLength={studentsLength}
        />
      ) : activeTab === "students" ? (
        <StudentsTab details={details} classId={classId} onLoad={() => void load()} />
      ) : activeTab === "guides" ? (
        <GuidesTab classId={classId} />
      ) : activeTab === "quests" ? (
        <QuestsTab classId={classId} onLoad={() => void load()} />
      ) : activeTab === "assignments" ? (
        <AssignmentsTab classId={classId} onLoad={() => void load()} />
      ) : activeTab === "pretests" ? (
        <PreTestsTab classId={classId} onLoad={() => void load()} />
      ) : activeTab === "assessments" ? (
        <AssessmentsTab classId={classId} onLoad={() => void load()} />
      ) : activeTab === "grades" ? (
        <GradesTab classId={classId} />
      ) : activeTab === "settings" ? (
        <SettingsTab details={details} classId={classId} onLoad={() => void load()} />
      ) : null}
    </div>
  );
}
