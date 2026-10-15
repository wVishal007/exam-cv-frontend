import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-line/60 dark:border-line-dark/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-xs text-ink-muted dark:text-ink-muted-dark sm:flex-row">
        <div>
          <p>© {new Date().getFullYear()} exam-cv.</p>
          <p>ATS analysis and carefully typeset LaTeX templates.</p>
        </div>
        <nav aria-label="Legal" className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="transition-colors hover:text-ink dark:hover:text-ink-dark"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="transition-colors hover:text-ink dark:hover:text-ink-dark"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="transition-colors hover:text-ink dark:hover:text-ink-dark"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}