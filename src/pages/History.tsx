import { useEffect, useState } from "react";

import { useAnalysisHistory, useRewriteHistory, useGeneratedResumePdf } from "@/hooks/useResume";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/axios";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";

  const parsed = new Date(iso);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function Score({ value }: { value: number | null | undefined }) {
  return (
    <span className="font-mono tabular-nums font-semibold text-ink dark:text-ink-dark">
      {value ?? "—"}
    </span>
  );
}

export function History() {
  const analysisQuery = useAnalysisHistory();
  const rewriteQuery = useRewriteHistory();
  const downloadPdf = useGeneratedResumePdf();
  useDocumentTitle("History");

  const [message, setMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const error = analysisQuery.error ?? rewriteQuery.error;
    if (!error) return;

    let cancelled = false;

    getErrorMessage(error, "History is unavailable right now.").then((m) => {
      if (!cancelled) setMessage(m);
    });

    return () => {
      cancelled = true;
    };
  }, [analysisQuery.error, rewriteQuery.error]);

  async function handleDownload(resumeId: number, fileName: string) {
    try {
      setDownloadingId(resumeId);
      const blob = await downloadPdf.mutateAsync(resumeId);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `resume_${resumeId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = await getErrorMessage(
        error,
        "Unable to download the generated resume."
      );
      setMessage(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  }

  const isLoading = analysisQuery.isLoading || rewriteQuery.isLoading;
  const analyses = analysisQuery.data ?? [];
  const rewrites = rewriteQuery.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="History"
          description="Your resume analyses and generated resumes."
        />
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-ink-muted dark:text-ink-muted-dark"
        >
          Loading…
        </p>
      </div>
    );
  }

  const isEmpty =
    !analyses.length &&
    !rewrites.length &&
    !analysisQuery.isError &&
    !rewriteQuery.isError;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="History"
        description="Your resume analyses and generated resumes."
      />

      {isEmpty && (
        <Card className="soft-inset-sm flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-line/80">
          <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
            Nothing here yet — analyze or rewrite a resume to see it here.
          </p>
        </Card>
      )}

      {message && (
        <Card className="soft-inset-sm rounded-xl border border-dashed border-line/80">
          <CardBody className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink-muted dark:text-ink-muted-dark">{message}</p>
            <Button
              variant="secondary"
              onClick={() => {
                setMessage(null);
                analysisQuery.refetch();
                rewriteQuery.refetch();
              }}
            >
              Try again
            </Button>
          </CardBody>
        </Card>
      )}

      {analyses.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              Analysis History
            </h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-ink-muted-dark">
              Previous resume analyses and ATS results.
            </p>
          </div>

          <Card>
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Resume</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>ATS Score</TableHead>
                  <TableHead>JD Match</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {analyses.map((record) => (
                  <TableRow key={`${record.resume_id}-${record.analysis_created_at}`}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-ink dark:text-ink-dark">
                          {record.file_name}
                        </span>
                        <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                          Resume #{record.resume_id}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-ink-muted dark:text-ink-muted-dark">
                      {formatDate(record.analysis_created_at)}
                    </TableCell>

                    <TableCell>
                      <Score value={record.ats_score} />
                    </TableCell>

                    <TableCell>
                      <Score value={record.analysis_match_score} />
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-xs leading-5 text-ink-muted dark:text-ink-muted-dark">
                        {record.feedback || "—"}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {rewrites.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              Generated Resumes
            </h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-ink-muted-dark">
              Resumes rewritten using your selected templates.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rewrites.map((record) => (
              <Card key={record.new_resume_id} className="overflow-hidden">
                {record.preview_img_url ? (
                  <img
                    src={record.preview_img_url}
                    alt={`${record.template_name ?? "Resume"} preview`}
                    className="aspect-[3/4] w-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center bg-paper text-sm text-ink-muted dark:bg-paper-dark dark:text-ink-muted-dark">
                    No preview available
                  </div>
                )}

                <CardBody className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium text-ink dark:text-ink-dark">
                      {record.template_name ?? "Unknown template"}
                    </h3>
                    <p className="truncate text-xs text-ink-muted dark:text-ink-muted-dark">
                      {record.file_name}
                    </p>
                    <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                      Generated {formatDate(record.generated_created_at)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="soft-inset-sm rounded-xl border border-transparent p-3">
                      <p className="text-[11px] uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                        ATS Score
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        <Score value={record.ats_score} />
                      </p>
                    </div>

                    <div className="soft-inset-sm rounded-xl border border-transparent p-3">
                      <p className="text-[11px] uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                        JD Match
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        <Score value={record.analysis_match_score} />
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    disabled={downloadingId === record.resume_id}
                    onClick={() => handleDownload(record.resume_id, record.file_name)}
                  >
                    {downloadingId === record.resume_id
                      ? "Downloading…"
                      : "Download PDF"}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}