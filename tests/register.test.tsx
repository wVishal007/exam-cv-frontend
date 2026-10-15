import { describe, expect, it, vi, beforeEach } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Register } from "@/pages/Register";
import { renderApp, makeAxiosError } from "./testUtils";
import { StateProbe } from "./probes";

vi.mock("@/api/auth", () => ({
  fetchProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import { registerUser } from "@/api/auth";

function renderRegister() {
  return renderApp(
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<StateProbe />} />
    </Routes>,
    { route: "/register" }
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Password"), "correct-horse");
}

describe("Register", () => {
  beforeEach(() => {
    vi.mocked(registerUser).mockReset();
  });

  it("blocks submission while required fields are empty", () => {
    renderRegister();
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  });

  it("rejects a mismatched confirmation password", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.type(screen.getByLabelText("Confirm password"), "something-else");

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  });

  it("surfaces a duplicate-email error from the server", async () => {
    const user = userEvent.setup();
    vi.mocked(registerUser).mockRejectedValue(
      makeAxiosError(409, { detail: "An account already exists for this email" })
    );

    renderRegister();

    await fillValidForm(user);
    await user.type(screen.getByLabelText("Confirm password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "An account already exists for this email (HTTP 409)"
    );
  });

  it("navigates to /login with a registration success flag", async () => {
    const user = userEvent.setup();
    vi.mocked(registerUser).mockResolvedValue(undefined as never);

    renderRegister();

    await fillValidForm(user);
    await user.type(screen.getByLabelText("Confirm password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledTimes(1);
      // React Query passes a context object as the second argument.
      expect(vi.mocked(registerUser).mock.calls[0][0]).toEqual({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "correct-horse",
      });
    });

    const stateEl = await screen.findByTestId("location-state");
    expect(stateEl).toHaveTextContent('"registered":true');
  });
});