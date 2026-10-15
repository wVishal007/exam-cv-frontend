import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Separator } from "@/components/ui/Separator";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navLinks } from "./navLinks";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open menu"
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col">
        <SheetTitle className="sr-only">Menu</SheetTitle>

        <nav aria-label="Primary" className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent dark:bg-accent-soft-dark dark:text-accent-dark"
                    : "text-ink hover:bg-muted/60 dark:text-ink-dark"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Separator className="my-4" />

        <div className="flex items-center justify-between px-3">
          <span className="text-sm text-ink-muted dark:text-ink-muted-dark">Theme</span>
          <ThemeToggle />
        </div>

        {isAuthenticated && (
          <Button
            variant="ghost"
            className="mt-4 justify-start px-3"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            Sign out
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}