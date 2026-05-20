import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LuxeGlow Salon & Spa" },
      { name: "description", content: "Our story, our team, and our commitment to luxury beauty and wellness." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
      <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Our Story</span>
      <h1 className="font-display text-5xl mt-2">Crafted with care since 2017</h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        LuxeGlow began with a simple idea: a salon should feel like a sanctuary.
        Eight years and twelve thousand guests later, we are still obsessed with the
        details — the lighting, the music, the precision of every cut and stroke.
      </p>
      <div className="hairline-divider my-12" />
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { t: "Our Mission", d: "Deliver world-class beauty rituals that leave guests feeling more themselves." },
          { t: "Our Vision", d: "To set the gold standard for premium salon experiences in India." },
          { t: "Our Promise", d: "Premium products. Senior artists. Hygiene without compromise." },
          { t: "Our Craft", d: "Continuous training with international masters in Paris, Milan and Tokyo." },
        ].map((b) => (
          <Card key={b.t} className="p-6">
            <Sparkles className="h-5 w-5 text-[var(--color-gold)]" />
            <h3 className="font-display text-xl mt-3">{b.t}</h3>
            <p className="text-sm text-muted-foreground mt-2">{b.d}</p>
          </Card>
        ))}
      </div>
      <div className="hairline-divider my-12" />
      <h2 className="font-display text-3xl">Meet the Team</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {[
          { n: "Aanya Kapoor", r: "Founder & Creative Director" },
          { n: "Ishaan Verma", r: "Master Stylist" },
          { n: "Meera Joshi", r: "Lead Skin Therapist" },
        ].map((m) => (
          <Card key={m.n} className="p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full gradient-gold flex items-center justify-center font-display text-2xl text-ink">
              {m.n.split(" ").map((w) => w[0]).join("")}
            </div>
            <div className="font-display text-lg mt-4">{m.n}</div>
            <div className="text-xs text-muted-foreground">{m.r}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
