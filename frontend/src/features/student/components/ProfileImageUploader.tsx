import { Camera, RotateCcw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { resolveAvatarUrl } from "@/features/student/services/studentService";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type ProfileImageUploaderProps = {
  name: string;
  avatarUrl?: string | null;
  selectedFile: File | null;
  previewUrl: string;
  disabled?: boolean;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
};

export function ProfileImageUploader({
  name,
  avatarUrl,
  selectedFile,
  previewUrl,
  disabled,
  onSelectFile,
  onRemove,
  onError,
}: ProfileImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const resolvedAvatarUrl = previewUrl || resolveAvatarUrl(avatarUrl);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const validateAndSelect = (file?: File) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError("Choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      onError("Profile image must be 5MB or smaller.");
      return;
    }

    onSelectFile(file);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="group relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-primary/70 bg-black/35 shadow-[0_0_34px_oklch(0.82_0.17_80/0.45)] transition hover:scale-[1.03] hover:border-accent hover:shadow-[0_0_44px_oklch(0.65_0.18_155/0.55)] disabled:cursor-not-allowed disabled:opacity-60 sm:mx-0"
        aria-label="Upload profile image"
      >
        {resolvedAvatarUrl ? (
          <img
            src={resolvedAvatarUrl}
            alt={`${name}'s profile`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center bg-[var(--gradient-gold)] font-display text-4xl text-gold-foreground">
            {initials || "AQ"}
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-8 w-8 text-primary" />
        </span>
      </button>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          validateAndSelect(event.dataTransfer.files[0]);
        }}
        className={`rounded-2xl border p-4 transition ${
          dragActive ? "border-accent bg-accent/10" : "border-primary/20 bg-black/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => validateAndSelect(event.target.files?.[0])}
        />
        <p className="font-display text-sm uppercase tracking-[0.2em] text-primary">
          Profile Image
        </p>
        <p className="mt-1 text-sm text-stone-foreground/68">
          Click the avatar or drop an image here. JPG, PNG, or WEBP up to 5MB.
        </p>
        {selectedFile ? <p className="mt-2 text-sm text-accent">{selectedFile.name}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="btn-game px-4 py-2 text-xs"
          >
            <Upload className="h-4 w-4" /> Upload Image
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="btn-game btn-stone px-4 py-2 text-xs"
          >
            {resolvedAvatarUrl ? <X className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}{" "}
            Remove Image
          </button>
        </div>
      </div>
    </div>
  );
}
