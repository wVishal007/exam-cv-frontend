import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import type { RewriteResult } from "@/types";
import { useRewriteResume, useTemplates, useGeneratedResumePdf } from "@/hooks/useResume";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/axios";
import { PageHeader } from "@/components/layout/PageHeader";
import { UploadStep } from "@/components/rewrite/UploadStep";
import { TemplatePicker } from "@/components/rewrite/TemplatePicker";
import { ResultPanel } from "@/components/rewrite/ResultPanel";

export function Rewrite() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteResult | null>(null);

  const templatesQuery = useTemplates();
  const rewriteMutation = useRewriteResume();
  const pdfMutation = useGeneratedResumePdf();
  useDocumentTitle("Rewrite");

  // The object URL was previously only revoked at the start of the *next*
  // generate, so navigating away with a PDF open leaked the blob for the
  // lifetime of the page.
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const selectedTemplate = templatesQuery.data?.find(
    (template) => template.template_id === templateId
  );

  const canGenerate = Boolean(file && templateId);
  const generating = rewriteMutation.isPending || pdfLoading;

  async function handleRewrite() {
    if (!file || !templateId) return;

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    setPdfUrl(null);
    setPdfLoading(false);
    setRewriteError(null);
    setPdfError(null);

    try {
      const data = await rewriteMutation.mutateAsync({
        file,
        jobDescription,
        templateId,
      });
      setResult(data);

      setPdfLoading(true);
      try {
        const pdfBlob = await pdfMutation.mutateAsync(data.resume_id);
        setPdfUrl(URL.createObjectURL(pdfBlob));
      } catch (pdfErr) {
        setPdfError(
          await getErrorMessage(
            pdfErr,
            "Your resume was generated, but the PDF could not be loaded."
          )
        );
      } finally {
        setPdfLoading(false);
      }
    } catch (err) {
      setRewriteError(await getErrorMessage(err, "The rewrite failed. Please try again."));
    }
  }

  function handleOpenPdf() {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownloadPdf() {
    if (!pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = downloadFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadFileName() {
    const slug =
      (selectedTemplate?.name ?? "resume")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "resume";
    const date = new Date().toISOString().slice(0, 10);
    return `resume_${slug}_${date}.pdf`;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <PageHeader
          title="Rewrite with a template"
          description="Upload your resume, choose an ATS-safe design, and generate a polished PDF tailored to your target role."
        />

        <StepProgress
          hasFile={Boolean(file)}
          hasTemplate={Boolean(templateId)}
          hasResult={Boolean(result)}
          className="hidden lg:flex"
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <UploadStep
            file={file}
            onFileSelect={setFile}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
          />

          <TemplatePicker
            templates={templatesQuery.data}
            isLoading={templatesQuery.isLoading}
            hasError={templatesQuery.isError}
            onRetry={() => templatesQuery.refetch()}
            templateId={templateId}
            onSelect={setTemplateId}
            search={templateSearch}
            onSearchChange={setTemplateSearch}
            onGenerate={handleRewrite}
            canGenerate={canGenerate}
            generating={generating}
            generateError={rewriteError}
            hasFile={Boolean(file)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <ResultPanel
            result={result}
            pdfUrl={pdfUrl}
            pdfLoading={pdfLoading}
            pdfError={pdfError}
            onOpenPdf={handleOpenPdf}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>
      </div>
    </div>
  );
}

function StepProgress({
  hasFile,
  hasTemplate,
  hasResult,
  className = "",
}: {
  hasFile: boolean;
  hasTemplate: boolean;
  hasResult: boolean;
  className?: string;
}) {
  const steps = [
    { number: 1, label: "Upload", complete: hasFile, active: !hasFile },
    { number: 2, label: "Template", complete: hasTemplate, active: hasFile && !hasTemplate },
    { number: 3, label: "Generate", complete: hasResult, active: hasFile && hasTemplate && !hasResult },
  ];

  return (
    <div
      aria-label="Progress"
      className={`soft-inset-sm items-center gap-2 rounded-xl border border-transparent bg-card px-4 py-3 ${className}`}
    >
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2">
          <StepDot
            number={step.number}
            label={step.label}
            complete={step.complete}
            active={step.active}
          />
          {index < steps.length - 1 && (
            <div className="h-px w-5 bg-line dark:bg-line-dark" />
          )}
        </div>
      ))}
    </div>
  );
}

function StepDot({
  number,
  label,
  complete,
  active,
}: {
  number: number;
  label: string;
  complete: boolean;
  active: boolean;
}) {
  const highlight = complete || active;

  return (
    <div
      className={`flex items-center gap-2 whitespace-nowrap text-[11px] font-medium ${
        highlight ? "text-accent dark:text-accent-dark" : "text-ink-muted dark:text-ink-muted-dark"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
          complete
            ? "bg-accent text-white dark:bg-accent-dark"
            : active
              ? "bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark"
              : "bg-paper text-ink-muted dark:bg-paper-dark dark:text-ink-muted-dark"
        }`}
      >
        {complete ? <Check className="h-3.5 w-3.5" /> : number}
      </span>
      <span className={complete ? "hidden sm:inline" : ""}>{label}</span>
    </div>
  );
}