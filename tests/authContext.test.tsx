import { describe, expect, it, vi, beforeEach } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useAuth } from "@/context/AuthContext";
import { renderApp } from "./testUtils";
import { StateProbe } from "./probes";

vi.mock("@/api/auth", () => ({
  fetchProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import { fetchProfile } from "@/api/auth";

function AuthProbe() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div>
      <p data-testid="auth-state">
        {isLoading ? "loading" : isAuthenticated ? `authed:${user?.user_id}` : "signed-out"}
      </p>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("auth:unauthorized"))}
      >
        expire
      </button>
    </div>
  );
}

function renderAuth(path: string) {
  return renderApp(
    <Routes>
      <Route path="/app" element={<AuthProbe />} />
      <Route path="/login" element={<StateProbe />} />
    </Routes>,
    { route: path }
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.mocked(fetchProfile).mockReset();
  });

  it("boots signed-out with no token and no profile request", () => {
    renderApp(<AuthProbe />);

    expect(screen.getByTestId("auth-state")).toHaveTextContent("signed-out");
    expect(fetchProfile).not.toHaveBeenCalled();
  });

  it("resolves the profile and reports authenticated once the token is valid", async () => {
    localStorage.setItem("access_token", "token-123");
    vi.mocked(fetchProfile).mockResolvedValue({ user_id: 3 } as never);

    renderAuth("/app");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("authed:3");
    });
  });

  it("logouts and purges account caches when a background 401 fires", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access_token", "token-123");
    vi.mocked(fetchProfile).mockResolvedValue({ user_id: 3 } as never);

    const { queryClient } = renderAuth("/app");

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("authed:3");
    });

    // Seed the account-scoped caches exactly as a real session would.
    queryClient.setQueryData(["analysis-history"], ["row"]);
    queryClient.setQueryData(["rewrite-history"], ["row"]);
    queryClient.setQueryData(["templates"], ["row"]);

    await user.click(screen.getByRole("button", { name: "expire" }));

    // Bounced to the login page with an explanation for the banner.
    await waitFor(() => {
      expect(screen.getByTestId("location-state")).toHaveTextContent('"reason":"expired"');
    });

    // And the account-scoped caches are dropped. (The profile query lives on
    // under its disabled observer, so it is intentionally not asserted here.)
    expect(queryClient.getQueriesData({ queryKey: ["analysis-history"] })).toHaveLength(0);
    expect(queryClient.getQueriesData({ queryKey: ["rewrite-history"] })).toHaveLength(0);
    expect(queryClient.getQueriesData({ queryKey: ["templates"] })).toHaveLength(0);
  });
});