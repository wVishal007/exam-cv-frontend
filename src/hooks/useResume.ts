import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  analyzeResume,
  fetchAnalysisHistory,
  fetchRewriteHistory,
  fetchTemplates,
  getGeneratedResumePdf,
  rewriteResume,
} from "../api/resume";


export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
    staleTime: Infinity,
  });
}


export function useAnalysisHistory() {
  return useQuery({
    queryKey: ["analysis-history"],
    queryFn: fetchAnalysisHistory,
  });
}


export function useRewriteHistory() {
  return useQuery({
    queryKey: ["rewrite-history"],
    queryFn: fetchRewriteHistory,
  });
}


export function useGeneratedResumePdf() {
  return useMutation({
    mutationFn: (resumeId: number) => getGeneratedResumePdf(resumeId),
  });
}


export function useAnalyzeResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyzeResume,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["analysis-history"],
      });
    },
  });
}


export function useRewriteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewriteResume,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rewrite-history"],
      });

      queryClient.invalidateQueries({
        queryKey: ["analysis-history"],
      });
    },
  });
}