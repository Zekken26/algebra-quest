import { Link } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { ProfileImageUploader } from "@/features/student/components/ProfileImageUploader";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import { useStudentData } from "@/features/student/hooks/useStudentData";
import { updateStudentProfile } from "@/features/student/services/studentService";
import { getAuth } from "@/shared/services/api";

export function EditStudentProfilePage() {
  const { progress } = useStudentData();
  const user = getAuth();
  const [name, setName] = useState(user?.name ?? "Algebra Adventurer");
  const [email, setEmail] = useState(user?.email ?? "student@example.com");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasExistingAvatar = Boolean(user?.avatarUrl);
  const canRemoveAvatar = Boolean(previewUrl || (hasExistingAvatar && !removeAvatar));

  const displayAvatarUrl = useMemo(
    () => (removeAvatar ? null : user?.avatarUrl),
    [removeAvatar, user?.avatarUrl],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectAvatar = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const removeSelectedAvatar = () => {
    if (!canRemoveAvatar) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(null);
    setPreviewUrl("");
    setRemoveAvatar(true);
  };

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      await updateStudentProfile({
        name: name.trim(),
        email: email.trim(),
        avatar: avatarFile,
        removeAvatar,
      });
      toast.success("Profile saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ForestBackground>
      <StudentNavbar progress={progress} />
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
        <form onSubmit={submitProfile} className="quest-panel p-6">
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
            Student Profile
          </p>
          <h1 className="mt-2 font-display text-4xl text-primary glow-text">Edit Profile</h1>
          <div className="mt-6">
            <ProfileImageUploader
              name={name}
              avatarUrl={displayAvatarUrl}
              selectedFile={avatarFile}
              previewUrl={previewUrl}
              disabled={saving}
              onSelectFile={selectAvatar}
              onRemove={removeSelectedAvatar}
              onError={toast.error}
            />
          </div>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-stone-foreground/70">Name</span>
              <input
                className="teacher-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-stone-foreground/70">Email</span>
              <input
                className="teacher-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-game" disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Profile"}
            </button>
            <Link to="/student" className="btn-game btn-stone">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </main>
    </ForestBackground>
  );
}
