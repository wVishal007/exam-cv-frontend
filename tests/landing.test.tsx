import { describe, expect, it, vi, beforeEach } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import { Landing } from "@/pages/Landing";
import { renderApp } from "./testUtils";

vi.mock("@/api/resume", () => ({
  fetchTemplates: vi.fn(),
  analyzeResume: vi.fn(),
  rewriteResume: vi.fn(),
  getGeneratedResumePdf: vi.fn(),
  fetchAnalysisHistory: vi.fn(),
  fetchRewriteHistory: vi.fn(),
}));

vi.mock("@/api/auth", () => ({
  fetchProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import { fetchTemplates } from "@/api/resume";
import { fetchProfile } from "@/api/auth";

const templates = [
  { template_id: 1, name: "Modern", preview_img: "/previews/modern.png" },
  { template_id: 2, name: "Classic", preview_img: "/previews/classic.png" },
];

function renderLanding(route = "/") {
  return renderApp(
    <Routes>
      <Route path="/" element={<Landing />} />
    </Routes>,
    { route }
  );
}

describe("Landing", () => {
  beforeEach(() => {
    vi.mocked(fetchTemplates).mockReset();
    vi.mocked(fetchProfile).mockReset();
  });

  it("renders the hero and the step-by-step explanation", async () => {
    vi.mocked(fetchTemplates).mockResolvedValue(templates as never);
    renderLanding();

    expect(
      screen.getByRole("heading", { name: /second pass your résumé/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Upload your PDF/)).toBeInTheDocument();
    expect(screen.getByText(/Read the report/)).toBeInTheDocument();
    expect(screen.getByText(/Pick a template/)).toBeInTheDocument();
    expect(screen.getByText(/How the AI actually helps/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /second pair of eyes/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Reads it like a recruiter/)).toBeInTheDocument();
  });

  it("draws the live template gallery for anonymous visitors", async () => {
    vi.mocked(fetchTemplates).mockResolvedValue(templates as never);
    renderLanding();

    expect(await screen.findByText("Modern")).toBeInTheDocument();
    expect(screen.getByText("Classic")).toBeInTheDocument();
    expect(
      screen.getByAltText("Preview of the Modern template")
    ).toBeInTheDocument();
    // Anonymous visitors get the sign-in CTA.
    expect(
      screen.getByRole("link", { name: "Analyze your résumé" })
    ).toBeInTheDocument();
    // ... and a nudge toward the workspace.
    expect(
      screen.getByText(/Signing in takes you straight to your workspace/)
    ).toBeInTheDocument();
  });

  it("keeps the rest of the page intact when the gallery fails to load", async () => {
    vi.mocked(fetchTemplates).mockRejectedValue(new Error("network down"));
    renderLanding();

    expect(
      await screen.findByText(/could not be loaded right now/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("shows a signed-in visitor the workspace CTA instead", async () => {
    localStorage.setItem("access_token", "token-123");
    vi.mocked(fetchProfile).mockResolvedValue({ user_id: 1 } as never);
    vi.mocked(fetchTemplates).mockResolvedValue(templates as never);

    renderLanding();

    // Hero + trust-note CTA both point a signed-in visitor into the app.
    const cta = await screen.findAllByRole("link", { name: "Open your workspace" });
    expect(cta.length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("link", { name: "Analyze your résumé" })
    ).not.toBeInTheDocument();
    // Signed-in visitors already see the workspace CTA; no extra nudge needed.
    expect(
      screen.queryByText(/Signing in takes you straight to your workspace/)
    ).not.toBeInTheDocument();
  });
});