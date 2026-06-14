import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadTeacherQuestAsset } from "@/features/teacher/services/teacherService";
import type { QuestWizardValues } from "@/features/teacher/components/CreateQuestWizard";

type QuestGuideStepProps = {
  values: QuestWizardValues;
  errors: Record<string, string>;
  onChange: <K extends keyof QuestWizardValues>(field: K, value: QuestWizardValues[K]) => void;
};

function getQuestImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(
    /\/api$/,
    "",
  );
  return `${baseUrl}${url}`;
}

export function QuestGuideStep({ values, errors, onChange }: QuestGuideStepProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Quest asset must be a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadTeacherQuestAsset(file);
      onChange("guideImageUrl", imageUrl);
      toast.success("Image uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("guideImageUrl", "");
  };

  return (
    <div className="grid gap-4">
      {/* Image Upload Area */}
      <div className="teacher-card p-4 border border-primary/15 bg-black/20 rounded-xl">
        <span className="text-sm font-semibold text-stone-foreground/80 block mb-2">
          Quest Guide Image (Optional)
        </span>
        <p className="text-xs text-stone-foreground/60 mb-4">
          Upload an image (e.g. a graph, diagram) to represent this guide. If uploaded, text fields
          below can be left empty.
        </p>

        <div className="flex flex-wrap items-start gap-4">
          <div className="relative grid h-32 w-48 place-items-center overflow-hidden rounded-xl border border-primary/20 bg-black/25">
            {values.guideImageUrl ? (
              <>
                <img
                  src={getQuestImageUrl(values.guideImageUrl)}
                  alt="Guide asset"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-white hover:bg-destructive/80 transition"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <span className="text-xs text-stone-foreground/50">No image uploaded</span>
            )}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void handleUpload(event.target.files?.[0])}
            />
            <button
              type="button"
              className="btn-game text-sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : values.guideImageUrl ? "Change Image" : "Upload Image"}
            </button>
          </div>
        </div>
      </div>

      <label className="grid gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-stone-foreground/80">Short explanation</span>
          {values.guideImageUrl && (
            <span className="text-xs text-accent/80 font-normal">Optional (Image provided)</span>
          )}
        </div>
        <textarea
          className="teacher-input min-h-28"
          value={values.shortExplanation}
          onChange={(event) => onChange("shortExplanation", event.target.value)}
          placeholder="Explain the rule students should use before entering the quest."
        />
        {errors.shortExplanation ? (
          <span className="text-xs text-destructive">{errors.shortExplanation}</span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-stone-foreground/80">Example problem</span>
          {values.guideImageUrl && (
            <span className="text-xs text-accent/80 font-normal">Optional (Image provided)</span>
          )}
        </div>
        <input
          className="teacher-input"
          value={values.exampleProblem}
          onChange={(event) => onChange("exampleProblem", event.target.value)}
          placeholder="3x + 4 = 19"
        />
        {errors.exampleProblem ? (
          <span className="text-xs text-destructive">{errors.exampleProblem}</span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-stone-foreground/80">
            Step-by-step solution
          </span>
          {values.guideImageUrl && (
            <span className="text-xs text-accent/80 font-normal">Optional (Image provided)</span>
          )}
        </div>
        <textarea
          className="teacher-input min-h-32"
          value={values.solutionStepsText}
          onChange={(event) => onChange("solutionStepsText", event.target.value)}
          placeholder={"Subtract 4 from both sides.\nDivide both sides by 3.\nx = 5."}
        />
        {errors.solutionStepsText ? (
          <span className="text-xs text-destructive">{errors.solutionStepsText}</span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-foreground/80">Tips / reminders</span>
        <textarea
          className="teacher-input min-h-24"
          value={values.tipsText}
          onChange={(event) => onChange("tipsText", event.target.value)}
          placeholder={"Undo addition or subtraction first.\nKeep both sides balanced."}
        />
      </label>
    </div>
  );
}
