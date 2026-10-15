import { describe, expect, it, vi, beforeEach } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Login } from "@/pages/Login";
import { renderApp, makeAxiosError } from "./testUtils";
import { LocationProbe, StateProbe } from "./probes";

vi.mock("@/api/auth", () => ({
  fetchProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import { loginUser } from "@/api/auth";

function renderLogin(state?: unknown) {
  return renderApp(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/app/analyze" element={<LocationProbe />} />
      <Route path="/app/rewrite" element={<LocationProbe />} />
      <Route path="*" element={<StateProbe />} />
    </Routes>,
    { route: "/login", state }
  );
}

describe("Login", () => {
  beforeEach(() => {
    vi.mocked(loginUser).mockReset();
  });

  it("starts with a disabled submit button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });

  it("signs in and returns the visitor to the protected page they asked for", async () => {
    const user = userEvent.setup();
    vi.mocked(loginUser).mockResolvedValue({
      access_token: "access",
      refresh_token: "refresh",
    } as never);

    renderLogin({ from: "/app/rewrite" });

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/app/rewrite");
    });
    expect(localStorage.getItem("access_token")).toBe("access");
    expect(localStorage.getItem("refresh_token")).toBe("refresh");
  });

  it("defaults into the workspace when no origin is remembered", async () => {
    const user = userEvent.setup();
    vi.mocked(loginUser).mockResolvedValue({
      access_token: "access",
      refresh_token: "refresh",
    } as never);

    renderLogin();

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/app/analyze");
    });
  });

  it("shows the rejection message when credentials are invalid", async () => {
    const user = userEvent.setup();
    vi.mocked(loginUser).mockRejectedValue(
      makeAxiosError(400, { detail: "Incorrect email or password" })
    );

    renderLogin();

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Incorrect email or password (HTTP 400)");
  });

  it("welcomes a visitor back after an expired session", () => {
    renderLogin({ reason: "expired" });

    expect(screen.getByText(/session expired/i)).toBeInTheDocument();
  });

  it("confirms a freshly registered account", () => {
    renderLogin({ registered: true });

    expect(screen.getByText(/account created/i)).toBeInTheDocument();
  });
});