import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { registerUser } from "@/api/auth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/axios";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const MIN_PASSWORD_LENGTH = 8;

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  useDocumentTitle("Create account");

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => navigate("/login", { state: { registered: true } }),
    onError: async (err) => {
      setError(await getErrorMessage(err, "Could not create your account."));
    },
  });

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const passwordsDiffer =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password === confirmPassword &&
    !mutation.isPending;

  function clearError() {
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate({ name, email, password });
  }

  return (
    <AuthShell title="Create your account" subtitle="Takes less than a minute.">
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-name">Full name</Label>
              <Input
                id="register-name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                aria-invalid={passwordTooShort || undefined}
                aria-describedby="register-password-hint"
              />
              <span
                id="register-password-hint"
                className="text-xs text-ink-muted dark:text-ink-muted-dark"
              >
                At least {MIN_PASSWORD_LENGTH} characters.
              </span>
              {passwordTooShort && (
                <p role="alert" className="text-xs text-danger dark:text-danger-dark">
                  Password must be at least {MIN_PASSWORD_LENGTH} characters.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-confirm-password">Confirm password</Label>
              <Input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError();
                }}
                aria-invalid={passwordsDiffer || undefined}
              />
              {passwordsDiffer && (
                <p role="alert" className="text-xs text-danger dark:text-danger-dark">
                  Passwords do not match.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="text-sm text-danger dark:text-danger-dark">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={!canSubmit}
              className="mt-2 w-full"
            >
              {mutation.isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
        Already have an account?{" "}
        <Link to="/login" className="text-accent dark:text-accent-dark">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}