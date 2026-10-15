import { Card, CardBody, CardHeader } from "./ui/Card";
import { ScoreGauge } from "./ui/ScoreGauge";
import type { ResumeAnalysis } from "../types";

function FeedbackList({ text }: { text: string }) {
  const items = (text ?? "").split("\n\n").filter(Boolean);
  if (!items.length) {
    return (
      <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
        No feedback was returned for this resume.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed">
          <span className="mt-0.5 font-mono text-xs text-ink-muted dark:text-ink-muted-dark">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-ink dark:text-ink-dark">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function AnalysisReport({ analysis }: { analysis: ResumeAnalysis }) {
  // `analysis_match_score` is a top-level field: graphs/nodes.py flattens the
  // analyzer's nested structured output before returning it, leaving the prose
  // in job_vs_resume_analysis as a plain string.
  const matchScore = analysis.analysis_match_score;
  const matchFeedback = analysis.job_vs_resume_analysis;

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      <Card>
        <CardBody className="flex flex-col items-center gap-8 py-8 sm:flex-row sm:justify-around">
          <ScoreGauge score={analysis.ats_score} label="ATS compatibility" />
          <ScoreGauge score={matchScore} label="Job description match" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-serif text-base font-semibold">Feedback</h2>
        </CardHeader>
        <CardBody>
          <FeedbackList text={analysis.feedback} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-serif text-base font-semibold">Job description match</h2>
        </CardHeader>
        <CardBody>
          {matchFeedback ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink dark:text-ink-dark">
              {matchFeedback}
            </p>
          ) : (
            <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
              No job description analysis was returned for this resume.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-serif text-base font-semibold">Suggestions</h2>
        </CardHeader>
        <CardBody>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink dark:text-ink-dark">
            {analysis.suggestions}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
