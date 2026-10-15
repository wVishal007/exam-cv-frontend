import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { loginUser } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/axios";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface LoginLocationState {
  from?: string;
  registered?: boolean;
  reason?: string;
}

/** Only honor internal absolute paths; never "//evil.com" or "mailto:". */
function isSafeInternalPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { setTokens } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle("Sign in");

  const state = (location.state ?? {}) as LoginLocationState;
  const expired = state.reason === "expired";
  const registered = state.registered === true;

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);

      // Return the visitor to the protected page they originally asked for,
      // or default into the workspace.
      const destination = isSafeInternalPath(state.from) ? state.from : "/app/analyze";
      navigate(destination, { replace: true });
    },
    onError: async (err) => {
      setError(await getErrorMessage(err, "Could not sign in. Check your details."));
    },
  });

  const canSubmit = email.trim() !== "" && password !== "" && !mutation.isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate({ email, password });
  }

  return (
    <AuthShell title="Sign in" subtitle="Analyze and rewrite your résumé.">
      {expired && (
        <div
          role="status"
          className="soft-inset-sm mb-4 rounded-xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm text-accent dark:border-accent-dark/15 dark:bg-accent-soft-dark dark:text-accent-dark"
        >
          Your session expired. Sign in again to pick up where you left off.
        </div>
      )}

      {registered && (
        <div
          role="status"
          className="soft-inset-sm mb-4 rounded-xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm text-accent dark:border-accent-dark/15 dark:bg-accent-soft-dark dark:text-accent-dark"
        >
          Account created. Sign in to continue.
        </div>
      )}

      <Card>
        <CardBody>
          <form
            onSubmit={handleSubmit}
            noValidate={false}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-danger dark:text-danger-dark">
                {error}
              </p>
            )}

            <Button type="submit" loading={mutation.isPending} disabled={!canSubmit} className="mt-2 w-full">
              {mutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
        New here?{" "}
        <Link to="/register" className="text-accent dark:text-accent-dark">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}