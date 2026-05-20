import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Sparkles, Scissors, Heart, Hand, Star, ArrowRight, Award, Users, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import { listServices, listReviews } from "@/lib/api.functions";
import { formatPrice, SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LuxeGlow Salon & Spa — Luxury Beauty & Wellness in Mumbai" },
      { name: "description", content: "Premium hair, skin, spa and nail services in a luxury salon. Book your LuxeGlow experience today." },
      { property: "og:title", content: "LuxeGlow Salon & Spa" },
      { property: "og:description", content: "Luxury Beauty & Wellness Experience." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const categoryIcon: Record<string, any> = { Hair: Scissors, Skin: Sparkles, Spa: Heart, Nails: Hand };

function Home() {
  const fetchServices = useServerFn(listServices);
  const fetchReviews = useServerFn(listReviews);
  const services = useQuery({ queryKey: ["services"], queryFn: () => fetchServices() });
  const reviews = useQuery({ queryKey: ["reviews"], queryFn: () => fetchReviews() });

  const previewServices = (services.data ?? []).slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="" className="w-full h-full object-cover" width={1600} height={1200} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
        </div>
        <div className="relative container mx-auto px-4 md:px-6 py-28 md:py-40 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 text-[var(--color-gold)] text-xs uppercase tracking-[0.3em] mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Mumbai's most loved salon
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-cream leading-[1.05]">
              Luxury <span className="text-gradient-gold italic">Beauty</span><br />
              & Wellness Experience
            </h1>
            <p className="mt-6 max-w-xl text-cream/75 text-base md:text-lg">
              Hand-crafted hair, skin, spa, and nail rituals in an atmosphere designed for stillness.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="luxe" size="lg">
                <Link to="/book">Book Appointment <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" className="bg-cream text-ink hover:bg-cream/90 border border-[var(--color-gold)]">
                <Link to="/services">View Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: "12k+", l: "Happy Guests", i: Users },
            { n: "8", l: "Years of Craft", i: Award },
            { n: "30+", l: "Signature Services", i: Sparkles },
            { n: "4.9★", l: "Average Rating", i: Star },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <s.i className="h-6 w-6 mx-auto text-[var(--color-gold)]" />
              <div className="font-display text-3xl md:text-4xl mt-2">{s.n}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Signature Menu</span>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Crafted Services</h2>
          </div>
          <Button asChild variant="outlineGold">
            <Link to="/services">All services <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewServices.map((s) => {
            const Icon = categoryIcon[s.category] ?? Sparkles;
            return (
              <motion.div key={s.id} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                <Card className="p-6 h-full border-border/60 hover:border-[var(--color-gold)] transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-lg gradient-gold text-ink"><Icon className="h-5 w-5" /></div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration_minutes}m</span>
                  </div>
                  <h3 className="font-display text-xl mt-4">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{s.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-semibold text-lg">{formatPrice(s.price_cents)}</span>
                    <Link to="/book" search={{ service: s.id } as any} className="text-sm font-medium text-[var(--color-gold)] group-hover:underline">
                      Book →
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Inside the studio</span>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Moments of Luxe</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[g1, g2, g3, g4].map((src, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="overflow-hidden rounded-lg aspect-[4/5]">
                <img src={src} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outlineGold"><Link to="/gallery">View full gallery</Link></Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Loved by guests</span>
          <h2 className="font-display text-4xl md:text-5xl mt-2">Kind Words</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(reviews.data ?? []).slice(0, 3).map((r) => (
            <Card key={r.id} className="p-6 bg-card/60 backdrop-blur">
              <div className="flex gap-0.5 text-[var(--color-gold)] mb-3">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">"{r.comment}"</p>
              <div className="mt-4 font-medium text-sm">— {r.customer_name}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink text-cream p-10 md:p-16 text-center">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full gradient-gold opacity-20 blur-3xl" />
          <h2 className="font-display text-4xl md:text-5xl relative">Ready to be pampered?</h2>
          <p className="mt-4 text-cream/70 max-w-xl mx-auto relative">{SITE.hours}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 relative">
            <Button asChild variant="luxe" size="lg">
              <Link to="/book"><Calendar className="h-4 w-4" /> Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-cream/40 text-cream hover:bg-cream hover:text-ink">
              <a href={waLink()} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
