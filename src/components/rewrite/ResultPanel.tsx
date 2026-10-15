import { Check, Download, FileText, LayoutTemplate, Sparkles, Upload } from "lucide-react";

import type { RewriteResult } from "@/types";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

interface ResultPanelProps {
  result: RewriteResult | null;
  pdfUrl: string | null;
  pdfLoading: boolean;
  pdfError: string | null;
  onOpenPdf: () => void;
  onDownloadPdf: () => void;
}

export function ResultPanel({
  result,
  pdfUrl,
  pdfLoading,
  pdfError,
  onOpenPdf,
  onDownloadPdf,
}: ResultPanelProps) {
  if (!result) {
    return (
      <Card className="flex min-h-[520px] flex-1 items-center justify-center overflow-hidden">
        <CardBody className="flex max-w-sm flex-col items-center justify-center px-6 py-12 text-center">
          <div className="soft-inset-sm mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-transparent bg-card text-accent dark:text-accent-dark">
            <FileText className="h-7 w-7" aria-hidden="true" />
          </div>

          <h2 className="font-serif text-lg font-semibold tracking-tight text-ink dark:text-ink-dark">
            Your rewritten resume will appear here
          </h2>

          <p className="mt-2 text-sm leading-6 text-ink-muted dark:text-ink-muted-dark">
            Upload your resume and select one of the templates. Your generated
            ATS score and PDF will appear here.
          </p>

          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            <MiniFeature icon={<Upload className="h-4 w-4" />} text="Upload" />
            <MiniFeature icon={<LayoutTemplate className="h-4 w-4" />} text="Choose" />
            <MiniFeature icon={<Sparkles className="h-4 w-4" />} text="Generate" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardBody className="p-5 sm:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  Result
                </p>
                <h2 className="mt-1 font-serif text-lg font-semibold tracking-tight">
                  Rewritten ATS score
                </h2>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent dark:bg-accent-soft-dark dark:text-accent-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-accent-dark" />
                Generated
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 py-2">
              <ScoreGauge score={result.ats_score} label="ATS score" />
              <ScoreGauge score={result.analysis_match_score} label="Job match" />
            </div>

            <div className="soft-inset-sm grid grid-cols-3 divide-x divide-line rounded-xl bg-card dark:divide-line-dark">
              <ScoreFeature icon={<Check className="h-3.5 w-3.5" />} label="Clean structure" />
              <ScoreFeature icon={<Check className="h-3.5 w-3.5" />} label="Keyword ready" />
              <ScoreFeature icon={<Check className="h-3.5 w-3.5" />} label="ATS friendly" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="min-h-0 overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-ink dark:text-ink-dark">
                  Generated resume
                </h2>
                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                  Your rewritten resume as a PDF
                </p>
              </div>
            </div>

            {pdfUrl && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onOpenPdf}
                  className="soft-sm inline-flex h-8 items-center gap-1.5 rounded-lg border border-transparent bg-card px-3 text-[11px] font-medium text-ink transition-all hover:soft-hover active:soft-inset-sm dark:text-ink-dark"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Open
                </button>

                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className="soft-sm inline-flex h-8 items-center gap-1.5 rounded-lg border border-transparent bg-card px-3 text-[11px] font-medium text-ink transition-all hover:soft-hover active:soft-inset-sm dark:text-ink-dark"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-3">
          {pdfLoading ? (
            <div
              role="status"
              aria-live="polite"
              className="soft-inset-sm flex min-h-[500px] items-center justify-center rounded-xl border border-transparent"
            >
              <div className="text-center">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-accent dark:border-accent-dark/20 dark:border-t-accent-dark"
                />
                <p className="text-sm font-medium text-ink dark:text-ink-dark">
                  Preparing your PDF…
                </p>
                <p className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
                  Compiling your rewritten resume
                </p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="soft-inset-sm overflow-hidden rounded-xl border border-line/70 bg-card dark:border-line-dark/70">
              <iframe
                src={pdfUrl}
                title="Generated Resume PDF"
                className="h-[700px] w-full"
              />

              {/* Chromium has no built-in PDF viewer for blob-URL iframes and
                  renders the frame blank. Firefox is fine. Keep the file
                  reachable either way. */}
              <p className="border-t border-line/70 bg-card px-4 py-3 text-xs text-ink-muted dark:border-line-dark/70 dark:bg-card dark:text-ink-muted-dark">
                Preview not showing?{" "}
                <button
                  type="button"
                  onClick={onOpenPdf}
                  className="rounded-lg font-medium text-accent underline underline-offset-2 dark:text-accent-dark"
                >
                  Open the PDF in a new tab
                </button>{" "}
                or{" "}
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className="rounded-lg font-medium text-accent underline underline-offset-2 dark:text-accent-dark"
                >
                  download it
                </button>
                .
              </p>
            </div>
          ) : (
            <div
              role={pdfError ? "alert" : undefined}
              className="soft-inset-sm flex min-h-[500px] items-center justify-center rounded-xl border border-dashed border-line/80 px-6 text-center dark:border-line-dark/60"
            >
              <div className="text-center">
                <div className="flex justify-center text-ink-muted dark:text-ink-muted-dark">
                  <FileText className="h-7 w-7" aria-hidden="true" />
                </div>

                <p className="mt-3 text-sm font-medium text-ink dark:text-ink-dark">
                  {pdfError ? "PDF unavailable" : "Nothing generated yet"}
                </p>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-ink-muted dark:text-ink-muted-dark">
                  {pdfError ??
                    "Generate your rewritten resume to see the PDF here."}
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ScoreFeature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3">
      <div className="text-accent dark:text-accent-dark">{icon}</div>
      <span className="truncate text-center text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function MiniFeature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="soft-inset-sm flex flex-col items-center gap-2 rounded-xl border border-transparent bg-card px-2 py-3">
      <div className="text-accent dark:text-accent-dark">{icon}</div>
      <span className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
        {text}
      </span>
    </div>
  );
}