import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ResumeUploadForm } from "@/components/ResumeUploadForm";
import { CardTitle, CardDescription } from "@/components/ui/Card";
import { Info } from "lucide-react";

interface UploadStepProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  error?: string | null;
}

export function UploadStep({
  file,
  onFileSelect,
  jobDescription,
  onJobDescriptionChange,
  error,
}: UploadStepProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-card/50">
        <StepHeading
          number={1}
          title="Upload resume & add details"
          description="Your existing content stays the source for the rewrite."
        />
      </CardHeader>

      <CardBody>
        <ResumeUploadForm
          file={file}
          onFileSelect={onFileSelect}
          jobDescription={jobDescription}
          onJobDescriptionChange={onJobDescriptionChange}
          error={error}
        />

        <div className="soft-inset-sm mt-5 flex items-start gap-3 rounded-xl border border-accent/10 bg-accent-soft/50 px-4 py-3 dark:border-accent-dark/10 dark:bg-accent-soft-dark/30">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark">
            <Info className="h-4 w-4" aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs font-semibold text-ink dark:text-ink-dark">
              Better tailoring with a job description
            </p>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted dark:text-ink-muted-dark">
              Add the target job description and the rewrite will be tailored
              around relevant skills and keywords.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function StepHeading({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white dark:bg-accent-dark"
      >
        {number}
      </div>

      <div className="flex min-w-0 flex-col">
        <CardTitle className="text-ink dark:text-ink-dark">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </div>
  );
}