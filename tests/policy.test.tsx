import { describe, expect, it, vi, beforeEach } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import { Privacy } from "@/pages/Privacy";
import { Terms } from "@/pages/Terms";
import { Contact } from "@/pages/Contact";
import { renderApp } from "./testUtils";

vi.mock("@/api/auth", () => ({
  fetchProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import { fetchProfile } from "@/api/auth";

function renderPublicPage(route: string, element: React.ReactElement) {
  return renderApp(
    <Routes>
      <Route path={route} element={element} />
    </Routes>,
    { route }
  );
}

describe("Legal & contact pages", () => {
  beforeEach(() => {
    vi.mocked(fetchProfile).mockReset();
  });

  it("renders the privacy policy", async () => {
    renderPublicPage("/privacy", <Privacy />);

    expect(
      screen.getByRole("heading", { name: "Privacy policy" })
    ).toBeInTheDocument();
    expect(screen.getByText(/What we collect/)).toBeInTheDocument();
    expect(
      screen.getByText(/Requesting removal/)
    ).toBeInTheDocument();
  });

  it("renders the terms of service", async () => {
    renderPublicPage("/terms", <Terms />);

    expect(
      screen.getByRole("heading", { name: "Terms of service" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AI output is assistance, not advice/)
    ).toBeInTheDocument();
  });

  it("renders the developer contact details", async () => {
    renderPublicPage("/contact", <Contact />);

    expect(
      screen.getByRole("heading", { name: "Contact" })
    ).toBeInTheDocument();
    expect(screen.getByText("Vishal Singh")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "vishalsingh31879@gmail.com" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "LinkedIn" }).getAttribute("href")
    ).toBe("https://linkedin.com/in/vishal-singh-188013324");
    expect(
      screen.getByRole("link", { name: "GitHub" }).getAttribute("href")
    ).toBe("https://github.com/wVishal007");
  });

  it("links the legal pages from the footer on every public page", async () => {
    renderPublicPage("/privacy", <Privacy />);

    expect(
      screen.getByRole("navigation", { name: "Legal" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy" }).getAttribute("href")
    ).toBe("/privacy");
    expect(screen.getByRole("link", { name: "Terms" }).getAttribute("href")).toBe(
      "/terms"
    );
    expect(
      screen.getByRole("link", { name: "Contact" }).getAttribute("href")
    ).toBe("/contact");
  });
});