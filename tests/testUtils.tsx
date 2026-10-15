import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

interface RenderAppOptions {
  route?: string;
  state?: unknown;
}

/**
 * Wraps `ui` in the full provider stack (query client, theme, router, auth)
 * with a fresh QueryClient (no retries) and an auth state dictated solely by
 * localStorage + the mocked auth API, exactly like production.
 */
export function renderApp(ui: ReactElement, options: RenderAppOptions = {}) {
  const { route = "/", state } = options;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[{ pathname: route, state }]}>
            <AuthProvider>{children}</AuthProvider>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  const result = render(ui, { wrapper: Wrapper });

  return { ...result, queryClient };
}

/** Builds a realistic AxiosError so getErrorMessage can decode it. */
export function makeAxiosError(status: number, data: unknown) {
  return new AxiosErrorLike(status, data);
}

class AxiosErrorLike extends Error {
  isAxiosError = true;
  response: { status: number; data: unknown };
  config: { url?: string } | undefined;

  constructor(status: number, data: unknown) {
    super(`Request failed with status code ${status}`);
    this.response = { status, data };
    this.config = { url: "/some-endpoint" };
  }
}