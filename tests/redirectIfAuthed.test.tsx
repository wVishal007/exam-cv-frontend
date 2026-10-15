import { describe, expect, it, vi, beforeEach } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import { RedirectIfAuthed } from "@/components/guards/RedirectIfAuthed";
import { renderApp } from "./testUtils";
import { LocationProbe } from "./probes";

vi.mock("@/api/auth", () => ({
  fetchProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import { fetchProfile } from "@/api/auth";

function RegisterProbe() {
  return <div>Register form</div>;
}

function renderRegister() {
  return renderApp(
    <Routes>
      <Route
        path="/register"
        element={
          <RedirectIfAuthed>
            <RegisterProbe />
          </RedirectIfAuthed>
        }
      />
      <Route path="/app/analyze" element={<LocationProbe />} />
    </Routes>,
    { route: "/register" }
  );
}

describe("RedirectIfAuthed", () => {
  beforeEach(() => {
    vi.mocked(fetchProfile).mockReset();
  });

  it("shows the public page to a signed-out visitor", () => {
    renderRegister();

    expect(screen.getByText("Register form")).toBeInTheDocument();
  });

  it("bounces a signed-in visitor straight into the workspace", async () => {
    localStorage.setItem("access_token", "token-123");
    vi.mocked(fetchProfile).mockResolvedValue({ user_id: 2 } as never);

    renderRegister();

    expect(await screen.findByTestId("location")).toHaveTextContent("/app/analyze");
    expect(screen.queryByText("Register form")).not.toBeInTheDocument();
  });
});