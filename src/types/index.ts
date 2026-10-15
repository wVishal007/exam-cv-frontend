/**
 * GET /my/profile returns only `{ "user_id": <int> }` — no name, no email.
 */
export interface User {
  user_id: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/**
 * Response of POST /analyze_resume.
 *
 * The backend returns `{ resume_id, ...analysis }` — the newer *_created_at /
 * file_name fields belong to history rows, not to this response.
 */
export interface ResumeAnalysis {
  resume_id: number;

  ats_score: number;
  feedback: string;
  suggestions: string;

  analysis_match_score: number;
  job_vs_resume_analysis: string;
}

/**
 * Response of POST /rewrite_resume: the analysis shape plus generation
 * metadata for locating and rendering the compiled PDF.
 */
export interface RewriteResult {
  new_resume_id: number;
  resume_id: number;

  pdf_url: string;
  preview_img_url: string | null;

  ats_score: number;
  feedback: string;
  suggestions: string;

  analysis_match_score: number;
  job_vs_resume_analysis: string;
}

/** One row of GET /analysis-history. */
export interface ResumeRecord {
  resume_id: number;
  file_name: string;
  resume_created_at: string;

  ats_score: number;
  analysis_created_at: string;

  feedback: string;
  suggestions: string;

  analysis_match_score: number;
  job_vs_resume_analysis: string;
}

/** One row of GET /rewrite-history. */
export interface RewriteHistoryRecord {
  new_resume_id: number;
  resume_id: number;
  preview_img_url: string | null;

  generated_created_at: string;
  resume_created_at: string;

  file_name: string;

  template_id: number;
  template_name: string | null;
  preview_img: string | null;

  ats_score: number | null;
  analysis_created_at: string | null;

  feedback: string | null;
  suggestions: string | null;

  analysis_match_score: number | null;
  job_vs_resume_analysis: string | null;
}

export interface TemplateOption {
  template_id: number;
  name: string;
  preview_img: string;
}