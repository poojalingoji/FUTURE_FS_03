import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-[var(--color-gold)]" />
          <span>{SITE.name.split(" ")[0]}<span className="text-gradient-gold">Glow</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/80 hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={isAdmin ? "/admin" : "/dashboard"}>
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
              </Button>
              <Button size="sm" variant="outlineGold" onClick={() => supabase.auth.signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="luxe" size="sm">
            <Link to="/book">Book Appointment</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-1.5 text-sm"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <Button asChild variant="ghost" size="sm">
                  <Link to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)}>
                    {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
              )}
              <Button asChild variant="luxe" size="sm">
                <Link to="/book" onClick={() => setOpen(false)}>Book Appointment</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
