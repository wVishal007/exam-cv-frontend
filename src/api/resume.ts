import { api } from "../lib/axios";

import type {
  ResumeAnalysis,
  ResumeRecord,
  RewriteHistoryRecord,
  RewriteResult,
  TemplateOption,
} from "../types";

export async function analyzeResume(payload: {
  file: File;
  jobDescription: string;
}): Promise<ResumeAnalysis> {
  const form = new FormData();

  form.append("file", payload.file);
  form.append("job_description", payload.jobDescription || "");

  const { data } = await api.post<ResumeAnalysis>("/analyze_resume", form);

  return data;
}

export async function rewriteResume(payload: {
  file: File;
  jobDescription: string;
  templateId: number;
}): Promise<RewriteResult> {
  const form = new FormData();

  form.append("file", payload.file);
  form.append("job_description", payload.jobDescription || "");
  form.append("template_id", String(payload.templateId));

  const { data } = await api.post<RewriteResult>("/rewrite_resume", form);

  return data;
}

export async function getGeneratedResumePdf(resumeId: number): Promise<Blob> {
  const response = await api.get(`/generated-resumes/${resumeId}/pdf`, {
    responseType: "blob",
  });

  return response.data;
}

export async function fetchTemplates(): Promise<TemplateOption[]> {
  const { data } = await api.get<TemplateOption[]>("/templates");

  return data;
}

export async function fetchAnalysisHistory(): Promise<ResumeRecord[]> {
  const { data } = await api.get<ResumeRecord[]>("/analysis-history");

  return data;
}

export async function fetchRewriteHistory(): Promise<RewriteHistoryRecord[]> {
  const { data } = await api.get<RewriteHistoryRecord[]>("/rewrite-history");

  return data;
}