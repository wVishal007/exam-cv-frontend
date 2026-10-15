import { Link, NavLink } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { MobileNav } from "./MobileNav";
import { navLinks } from "./navLinks";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="soft-sm sticky top-0 z-40 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            to="/app/analyze"
            className="shrink-0 font-serif text-lg font-semibold tracking-tight"
          >
            exam-cv
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1 text-sm transition-colors ${
                    isActive
                      ? "bg-muted/70 text-ink dark:text-ink-dark"
                      : "text-ink-muted hover:bg-muted/50 hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MobileNav />

          {/* Gated on the token, not on the profile query: /my/profile returns
              only a user_id, and a failed profile fetch used to hide Sign out
              entirely, stranding the user with no way back to the login page.
              The account menu shows the only identity detail the API offers. */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="soft-sm flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-card text-ink-muted transition-all hover:text-ink active:soft-inset-sm dark:bg-card dark:text-ink-muted-dark dark:hover:text-ink-dark"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user ? `Signed in as user #${user.user_id}` : "Signed in"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}