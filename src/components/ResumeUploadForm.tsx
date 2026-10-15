import type { ReactNode } from "react";

import { FileDropzone } from "@/components/ui/FileDropzone";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

const MAX_JD_CHARS = 5000;

interface ResumeUploadFormProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  submitLabel?: string;
  onSubmit?: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  actions?: ReactNode;
}

/**
 * The shared upload panel used by Analyze (single step) and Rewrite (wizard
 * step one): resume dropzone, optional job description with a character
 * counter, a labelled action button, and room for extra actions.
 */
export function ResumeUploadForm({
  file,
  onFileSelect,
  jobDescription,
  onJobDescriptionChange,
  submitLabel,
  onSubmit,
  loading,
  disabled,
  error,
  actions,
}: ResumeUploadFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <Field>
        <Label id="resume-upload-label">Resume</Label>
        <FileDropzone file={file} onFileSelect={onFileSelect} />
      </Field>

      <Field>
        <div className="flex items-baseline justify-between">
          <Label htmlFor="job-description">Job description</Label>
          <span className="font-mono text-xs text-ink-muted dark:text-ink-muted-dark" aria-live="polite">
            {jobDescription.length.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
          </span>
        </div>
        <Textarea
          id="job-description"
          rows={8}
          maxLength={MAX_JD_CHARS}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job posting to get a tailored match score…"
          className="resize-none"
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-danger dark:text-danger-dark">
          {error}
        </p>
      )}

      {(submitLabel || actions) && (
        <div className="flex flex-col gap-2">
          {submitLabel && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={disabled || !file}
              loading={loading}
              className="w-full"
            >
              {submitLabel}
            </Button>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}