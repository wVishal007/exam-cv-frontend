import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="soft-sm bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="font-serif text-lg font-semibold tracking-tight"
        >
          exam-cv
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link to="/app/analyze">Open workspace</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}