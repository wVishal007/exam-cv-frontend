import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  const { isAuthenticated } = useAuth();
  useDocumentTitle("Page not found");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-ink-muted dark:text-ink-muted-dark">404</p>
      <h1 className="font-serif text-2xl font-semibold tracking-tight">
        This page does not exist
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-ink-muted dark:text-ink-muted-dark">
        The link may be broken, or the page may have moved.
      </p>
      <Button asChild size="default" variant="secondary">
        <Link to={isAuthenticated ? "/app/analyze" : "/"}>
          {isAuthenticated ? "Back to your workspace" : "Back to home"}
        </Link>
      </Button>
    </div>
  );
}