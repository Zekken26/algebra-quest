import { Loader2, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  changeTeacherPassword,
  updateTeacherProfile,
  type TeacherProfile,
} from "@/features/teacher/services/teacherService";

type TeacherProfileFormProps = {
  profile: TeacherProfile;
  onUpdated: (profile: TeacherProfile) => void;
};

export function TeacherProfileForm({ profile, onUpdated }: TeacherProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
  }, [profile]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateTeacherProfile({ name, email });
      onUpdated(updated);
      toast.success("Profile saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await changeTeacherPassword({ currentPassword, newPassword, confirmNewPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Password changed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={saveProfile} className="teacher-card p-5">
        <h2 className="font-display text-xl text-primary">Account Details</h2>
        <div className="mt-5 grid gap-4">
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
          <button className="btn-game w-fit text-sm" disabled={savingProfile}>
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className="teacher-card p-5">
        <h2 className="font-display text-xl text-primary">Change Password</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-stone-foreground/70">Current Password</span>
            <input
              className="teacher-input"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-stone-foreground/70">New Password</span>
            <input
              className="teacher-input"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-stone-foreground/70">Confirm New Password</span>
            <input
              className="teacher-input"
              type="password"
              minLength={8}
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              required
            />
          </label>
          <button className="btn-game w-fit text-sm" disabled={savingPassword}>
            {savingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {savingPassword ? "Updating..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
