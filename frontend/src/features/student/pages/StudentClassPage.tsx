import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import { ClassNavBar, type ClassNavTab } from "@/shared/components/ClassNavBar";
import {
  fetchStudentClass,
  fetchStudentClassActivities,
  fetchStudentClassLeaderboard,
  fetchStudentClassProgress,
  fetchStudentClassQuestGuides,
  fetchStudentClassQuests,
  fetchStudentDashboard,
  getStudentProgress,
  toStudentProgressFromDashboard,
  type StudentActivityItem,
  type StudentAssignedQuest,
  type StudentClass,
  type StudentClassLeaderboardRow,
  type StudentClassProgress,
  type StudentQuestGuide,
} from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";
import { Eye, BookOpenText, Swords, FileText, BookOpen, Trophy, BarChart3 } from "lucide-react";
import { StudentOverviewTab } from "@/features/student/components/tabs/StudentOverviewTab";
import { StudentGuidesTab } from "@/features/student/components/tabs/StudentGuidesTab";
import { StudentQuestsTab } from "@/features/student/components/tabs/StudentQuestsTab";
import { StudentAssignmentsTab } from "@/features/student/components/tabs/StudentAssignmentsTab";
import { StudentPreTestsTab } from "@/features/student/components/tabs/StudentPreTestsTab";
import { StudentAssessmentsTab } from "@/features/student/components/tabs/StudentAssessmentsTab";
import { StudentProgressTab } from "@/features/student/components/tabs/StudentProgressTab";

const STUDENT_TABS: ClassNavTab[] = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "guides", label: "Guides", icon: BookOpenText },
  { id: "quests", label: "Quests", icon: Swords },
  { id: "assignments", label: "Assignments", icon: FileText },
  { id: "pretests", label: "Pre-Tests", icon: BookOpen },
  { id: "assessments", label: "Assessments", icon: Trophy },
  { id: "progress", label: "Progress", icon: BarChart3 },
];

type StudentClassPageProps = {
  classId: string;
};

export function StudentClassPage({ classId }: StudentClassPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [progress, setProgress] = useState<StudentProgress>(() => getStudentProgress());
  const [classInfo, setClassInfo] = useState<StudentClass | null>(null);
  const [guides, setGuides] = useState<StudentQuestGuide[]>([]);
  const [quests, setQuests] = useState<StudentAssignedQuest[]>([]);
  const [classProgress, setClassProgress] = useState<StudentClassProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<StudentClassLeaderboardRow[]>([]);
  const [activities, setActivities] = useState<StudentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [nextClass, nextGuides, nextQuests, nextProgress, nextLeaderboard, dashboard, nextActivities] =
      await Promise.all([
        fetchStudentClass(classId),
        fetchStudentClassQuestGuides(classId),
        fetchStudentClassQuests(classId),
        fetchStudentClassProgress(classId),
        fetchStudentClassLeaderboard(classId),
        fetchStudentDashboard(),
        fetchStudentClassActivities(classId),
      ]);
    console.log("[StudentClassPage] classId:", classId);
    console.log("[StudentClassPage] nextClass:", nextClass);
    console.log("[StudentClassPage] guides:", nextGuides?.length);
    console.log("[StudentClassPage] quests:", nextQuests?.length);
    console.log("[StudentClassPage] activities:", nextActivities?.activities?.length, JSON.stringify(nextActivities?.activities?.map(a => ({ id: a.id, type: a.type, title: a.title, contentId: a.content?.id }))));
    setProgress(toStudentProgressFromDashboard(dashboard, progress));
    setClassInfo(nextClass);
    setGuides(nextGuides);
    setQuests(nextQuests);
    setClassProgress(nextProgress);
    setLeaderboard(nextLeaderboard);
    setActivities(nextActivities.activities ?? []);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    load()
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load class.");
        navigate({ to: "/student" });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [classId, navigate]);

  return (
    <ForestBackground>
      <StudentNavbar progress={progress} />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ClassNavBar tabs={STUDENT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" ? (
          <StudentOverviewTab
            classInfo={classInfo}
            guides={guides}
            quests={quests}
            classProgress={classProgress}
            leaderboard={leaderboard}
            activities={activities}
            loading={loading}
          />
        ) : activeTab === "guides" ? (
          <StudentGuidesTab guides={guides} />
        ) : activeTab === "quests" ? (
          <StudentQuestsTab quests={quests} />
        ) : activeTab === "assignments" ? (
          <StudentAssignmentsTab activities={activities} />
        ) : activeTab === "pretests" ? (
          <StudentPreTestsTab activities={activities} />
        ) : activeTab === "assessments" ? (
          <StudentAssessmentsTab activities={activities} />
        ) : activeTab === "progress" ? (
          <StudentProgressTab
            classProgress={classProgress}
            questsCount={quests.length}
            guidesCount={guides.length}
            activitiesCount={activities.length}
          />
        ) : null}
      </main>
    </ForestBackground>
  );
}
