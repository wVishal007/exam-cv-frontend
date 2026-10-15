import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileDown, ScanSearch, ScanText, Target, PenLine, ShieldCheck, MoveRight, Upload } from "lucide-react";

import { fetchTemplates } from "@/api/resume";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const steps = [
  {
    icon: Upload,
    title: "Upload your PDF",
    body: "Your résumé is parsed for text and structure. Files stay locked to your account.",
  },
  {
    icon: ScanSearch,
    title: "Read the report",
    body: "An ATS score, section-by-section feedback, and a match rating against the job description.",
  },
  {
    icon: FileDown,
    title: "Pick a template",
    body: "Eleven handcrafted LaTeX designs, compiled to a clean, downloadable PDF.",
  },
];

const aiFeatures = [
  {
    icon: ScanText,
    title: "Reads it like a recruiter",
    body: "Scores your résumé the way an tracking system would, against your specific job description — not a generic checklist.",
  },
  {
    icon: Target,
    title: "Tailors to the role",
    body: "Feedback and rewording target the job you're applying to, so the same résumé reads differently for each role.",
  },
  {
    icon: PenLine,
    title: "Rewrites in one pass",
    body: "An evening of manual tailoring becomes one upload — the AI sharpens your wording while keeping your real facts.",
  },
  {
    icon: ShieldCheck,
    title: "Stays on the rails",
    body: "The AI writes the content; a locked template compiles it into a clean PDF. No guessed layouts, no broken formatting.",
  },
];

function AttentionButton({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 animate-[halo_2.2s_ease-in-out_infinite] rounded-xl bg-accent/25 blur-md dark:bg-accent-dark/25"
      />
      {children}
    </span>
  );
}

function TemplateGallery() {
  const query = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
    staleTime: Infinity,
  });

  return (
    <section id="templates" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-xl">
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Templates that read like they were set by a printer
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-ink-muted-dark">
          Serif body type, hairline rules, no gratuitous color. Every template is
          LaTeX — authored once, typeset perfectly, ejected as a PDF.
        </p>
      </div>

      {query.isLoading && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      )}

      {query.isError && (
        <Card className="soft-inset-sm border border-dashed border-line/80">
          <CardBody className="flex flex-col items-start gap-4">
            <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
              The template previews could not be loaded right now. They'll show
              again once the service is back.
            </p>
            <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
              Try again
            </Button>
          </CardBody>
        </Card>
      )}

      {query.data && query.data.length > 0 && (
        <div
          role="list"
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
        >
          {query.data.map((template) => (
            <div
              key={template.template_id}
              role="listitem"
              className="soft-sm overflow-hidden rounded-xl bg-card"
            >
              <img
                src={template.preview_img}
                alt={`Preview of the ${template.name} template`}
                className="aspect-[3/4] w-full object-cover object-top"
                loading="lazy"
              />
              <div className="border-t border-line/70 px-4 py-3 dark:border-line-dark/70">
                <p className="text-sm font-medium text-ink dark:text-ink-dark">
                  {template.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Landing() {
  const { isAuthenticated } = useAuth();
  useDocumentTitle();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
          <div className="max-w-2xl animate-[fadeIn_0.5s_ease-out]">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent dark:text-accent-dark">
              ATS analysis · LaTeX templates
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              The second pass your résumé has been waiting for.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted dark:text-ink-muted-dark">
              exam-cv <span className="text-ink dark:text-ink-dark">scores your PDF</span> the
              way an applicant-tracking system would, tells you what it found, and
              rewrites the whole thing on an editorially designed template — one
              upload, one polished download.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span
                aria-hidden="true"
                className="pointer-events-none flex shrink-0 items-center"
              >
                <MoveRight className="h-3.5 w-3.5 -mr-1 animate-[nudge_1.6s_ease-in-out_infinite] [animation-delay:-0.35s] text-ink-muted dark:text-ink-muted-dark" />
                <MoveRight className="h-4 w-4 animate-[nudge_1.6s_ease-in-out_infinite] text-accent dark:text-accent-dark" />
              </span>
              {isAuthenticated ? (
                <AttentionButton>
                  <Button asChild size="lg">
                    <Link to="/app/analyze">Open your workspace</Link>
                  </Button>
                </AttentionButton>
              ) : (
                <>
                  <AttentionButton>
                    <Button asChild size="lg">
                      <Link to="/login">Analyze your résumé</Link>
                    </Button>
                  </AttentionButton>
                  <Button asChild size="lg" variant="outline">
                    <a href="#templates">See the templates</a>
                  </Button>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <p className="mt-4 font-mono text-xs text-ink-muted dark:text-ink-muted-dark">
                Signing in takes you straight to your workspace.
              </p>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="soft-band bg-surface/60 dark:bg-surface-dark/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <div className="mb-10 max-w-xl">
              <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                Three steps, one clean PDF
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="soft-inset-sm flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-accent dark:text-accent-dark">
                      <step.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-ink-muted dark:text-ink-muted-dark">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW AI SPEEDS IT UP */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="mb-10 max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent dark:text-accent-dark">
              How the AI actually helps
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              The second pair of eyes you needed
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-ink-muted-dark">
              Most of the work in an application is rewriting your résumé for
              one specific role. This is where AI earns its keep — reading,
              tailoring, and drafting so you only review the result.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map((feature) => (
              <div
                key={feature.title}
                className="soft-sm flex flex-col gap-3 rounded-xl bg-card p-5"
              >
                <span className="soft-inset-sm flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-accent dark:text-accent-dark">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="font-serif text-base font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-ink-muted dark:text-ink-muted-dark">
            The AI drafts, you decide. Every result stays yours to review and
            edit before you send it.
          </p>
        </section>

        {/* TEMPLATES */}
        <TemplateGallery />

        {/* TRUST NOTE */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <Card>
            <CardBody className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <h2 className="font-serif text-xl font-semibold tracking-tight">
                  No sign-up walls, no upsells
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                  Create a free account, analyze as many résumés as you like, and
                  keep the ones that work. Your documents are used only to generate
                  your results, and they stay private to your account.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link to={isAuthenticated ? "/app/analyze" : "/register"}>
                  {isAuthenticated ? "Open your workspace" : "Create a free account"}
                </Link>
              </Button>
            </CardBody>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}