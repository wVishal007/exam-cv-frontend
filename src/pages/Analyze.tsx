import { useState } from "react";

import { useAnalyzeResume } from "@/hooks/useResume";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/axios";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResumeUploadForm } from "@/components/ResumeUploadForm";
import { AnalysisReport } from "@/components/AnalysisReport";
import { Card } from "@/components/ui/Card";

export function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useAnalyzeResume();
  useDocumentTitle("Analyze");

  async function handleAnalyze() {
    if (!file) return;
    setError(null);
    try {
      await mutation.mutateAsync({ file, jobDescription });
    } catch (err) {
      setError(await getErrorMessage(err, "Something went wrong while analyzing. Try again."));
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Analyze your résumé"
        description="Upload a PDF to get an ATS score, section-by-section feedback, and a match rating against a job description."
      />

      <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
        <Card>
          <div className="px-6 py-5">
            <ResumeUploadForm
              file={file}
              onFileSelect={setFile}
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              submitLabel={mutation.isPending ? "Analyzing…" : "Run analysis"}
              onSubmit={handleAnalyze}
              loading={mutation.isPending}
              error={error}
            />
          </div>
        </Card>

        <div>
          {mutation.data ? (
            <AnalysisReport analysis={mutation.data} />
          ) : mutation.isPending ? (
            // The LLM round-trip is slow; without this the panel sat on the
            // "report appears here" placeholder for the whole duration.
            <Card
              className="soft-inset-sm flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed border-line/80"
              role="status"
              aria-live="polite"
            >
              <div className="text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-accent/20 border-t-accent dark:border-accent-dark/20 dark:border-t-accent-dark" />
                <p className="text-sm text-ink dark:text-ink-dark">
                  Reading your résumé…
                </p>
                <p className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
                  Scoring, feedback and job match usually take under a minute.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="soft-inset-sm flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed border-line/80">
              <p className="max-w-[220px] text-center text-sm text-ink-muted dark:text-ink-muted-dark">
                Your report appears here once you run an analysis.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}