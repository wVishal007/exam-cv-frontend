import { describe, expect, it, vi, beforeEach } from "vitest";
import { Route, Routes, useLocation } from "react-router-dom";
import { screen } from "@testing-library/react";

import { RequireAuth } from "@/components/guards/RequireAuth";
import { renderApp } from "./testUtils";
import { LocationProbe } from "./probes";

vi.mock("@/api/auth", () => ({
  fetchProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import { fetchProfile } from "@/api/auth";

function ProtectedProbe() {
  const location = useLocation();
  return <div>Protected content at {location.pathname}</div>;
}

function renderGuarded(route: string) {
  return renderApp(
    <Routes>
      <Route
        path="/app/analyze"
        element={
          <RequireAuth>
            <ProtectedProbe />
          </RequireAuth>
        }
      />
      <Route
        path="/app/rewrite"
        element={
          <RequireAuth>
            <ProtectedProbe />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<LocationProbe />} />
    </Routes>,
    { route }
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.mocked(fetchProfile).mockReset();
  });

  it("redirects unauthenticated visitors to /login, remembering where they were headed", async () => {
    renderGuarded("/app/rewrite");

    expect(await screen.findByTestId("location")).toHaveTextContent("/login");
    expect(screen.queryByText(/Protected content/)).not.toBeInTheDocument();
  });

  it("shows a loading state while the profile request is in flight", async () => {
    localStorage.setItem("access_token", "token-123");
    // Never settles: the profile query stays pending so the gate holds.
    vi.mocked(fetchProfile).mockReturnValue(new Promise(() => {}));

    renderGuarded("/app/analyze");

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading your workspace…")).toBeInTheDocument();
  });

  it("renders children once authentication succeeds", async () => {
    localStorage.setItem("access_token", "token-123");
    vi.mocked(fetchProfile).mockResolvedValue({ user_id: 7 } as never);

    renderGuarded("/app/analyze");

    expect(await screen.findByText(/Protected content/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});