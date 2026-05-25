import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TeacherAvatarUploader } from "@/features/teacher/components/TeacherAvatarUploader";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { TeacherProfileForm } from "@/features/teacher/components/TeacherProfileForm";
import {
  fetchTeacherProfile,
  type TeacherProfile,
} from "@/features/teacher/services/teacherService";

export function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      setProfile(await fetchTeacherProfile());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load teacher profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  return (
    <div>
      <TeacherHeader
        title="Teacher Profile"
        subtitle="Manage your account details, avatar, and login credentials."
        actionLabel="Refresh Profile"
        onAction={() => void loadProfile()}
      />
      {loading ? <div className="teacher-card p-6">Loading profile...</div> : null}
      {!loading && profile ? (
        <div className="space-y-6">
          <TeacherAvatarUploader profile={profile} onUploaded={setProfile} />
          <TeacherProfileForm profile={profile} onUpdated={setProfile} />
        </div>
      ) : null}
    </div>
  );
}
