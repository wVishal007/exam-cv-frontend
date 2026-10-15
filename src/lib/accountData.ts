import type { QueryClient } from "@tanstack/react-query";

/**
 * Query keys holding account-specific data. All four are purged on logout and
 * on session expiry. Note the historical bug: this used to reference
 * ["history"], but the real keys are per-page ("analysis-history",
 * "rewrite-history"), so stale rows survived a sign-out/sign-in cycle.
 */
export const AUTH_QUERY_KEYS = [
  ["profile"],
  ["analysis-history"],
  ["rewrite-history"],
  ["templates"],
] as const;

export function purgeAccountData(queryClient: QueryClient) {
  for (const key of AUTH_QUERY_KEYS) {
    queryClient.removeQueries({ queryKey: key as unknown as string[] });
  }
}