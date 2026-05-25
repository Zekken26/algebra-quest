import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  uploadTeacherAvatar,
  type TeacherProfile,
} from "@/features/teacher/services/teacherService";

type TeacherAvatarUploaderProps = {
  profile: TeacherProfile;
  onUploaded: (profile: TeacherProfile) => void;
};

export function TeacherAvatarUploader({ profile, onUploaded }: TeacherAvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Avatar must be a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const updated = await uploadTeacherAvatar(file);
      onUploaded(updated);
      toast.success("Avatar updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload avatar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="teacher-card p-5">
      <h2 className="font-display text-xl text-primary">Profile Image</h2>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border border-primary/20 bg-black/25">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-3xl text-primary">
              {profile.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-stone-foreground/70">
            Upload a JPG, PNG, or WEBP image up to 5MB.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => void upload(event.target.files?.[0])}
          />
          <button
            type="button"
            className="btn-game mt-4 text-sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Change Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}
