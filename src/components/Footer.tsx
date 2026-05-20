import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Please enter a valid email");
    setBusy(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    toast.success("Subscribed — welcome to LuxeGlow!");
    setEmail("");
  };

  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="container mx-auto px-4 md:px-6 py-16 grid gap-12 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">
            Luxe<span className="text-gradient-gold">Glow</span>
          </div>
          <p className="mt-3 text-sm text-cream/70 leading-relaxed">
            A premium salon & spa experience crafted for those who appreciate the finer details.
          </p>
          <div className="flex gap-3 mt-5">
            <a href={SITE.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-cream/20 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={SITE.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-cream/20 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/services" className="hover:text-[var(--color-gold)]">Services</Link></li>
            <li><Link to="/gallery" className="hover:text-[var(--color-gold)]">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-[var(--color-gold)]">About</Link></li>
            <li><Link to="/faq" className="hover:text-[var(--color-gold)]">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Visit Us</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-gold)]" /><span>{SITE.address}</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-gold)]" /><span>{SITE.phone}</span></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-gold)]" /><span>{SITE.email}</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Newsletter</h4>
          <p className="text-sm text-cream/70 mb-3">Beauty rituals, offers & insider tips.</p>
          <form onSubmit={subscribe} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="bg-cream/10 border border-cream/20 px-3 py-2 rounded-md text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-[var(--color-gold)]"
            />
            <Button type="submit" variant="luxe" size="sm" disabled={busy}>
              {busy ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container mx-auto px-4 md:px-6 py-6 text-xs text-cream/50 flex flex-col md:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>{SITE.hours}</span>
        </div>
      </div>
    </footer>
  );
}
