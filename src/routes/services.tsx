import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { listServices } from "@/lib/api.functions";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Prices — LuxeGlow Salon & Spa" },
      { name: "description", content: "Hair, skin, spa and nail services with transparent prices." },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const fetchServices = useServerFn(listServices);
  const q = useQuery({ queryKey: ["services"], queryFn: () => fetchServices() });
  const [cat, setCat] = useState<string>("All");
  const cats = useMemo(() => ["All", ...Array.from(new Set((q.data ?? []).map((s) => s.category)))], [q.data]);
  const filtered = (q.data ?? []).filter((s) => cat === "All" || s.category === cat);

  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Menu</span>
      <h1 className="font-display text-5xl mt-2">Services & Pricing</h1>
      <div className="flex flex-wrap gap-2 mt-8">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${cat === c ? "gradient-gold text-ink border-transparent" : "border-border hover:border-[var(--color-gold)]"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {q.isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)
          : filtered.map((s) => (
              <Card key={s.id} className="p-6 hover:border-[var(--color-gold)] transition-colors">
                <div className="text-xs uppercase tracking-wider text-[var(--color-gold)]">{s.category}</div>
                <h3 className="font-display text-xl mt-2">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.description}</p>
                <div className="flex items-center justify-between mt-5">
                  <div>
                    <div className="font-semibold text-lg">{formatPrice(s.price_cents)}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" />{s.duration_minutes} min</div>
                  </div>
                  <Button asChild variant="luxe" size="sm">
                    <Link to="/book" search={{ service: s.id } as any}>Book now</Link>
                  </Button>
                </div>
              </Card>
            ))}
      </div>
    </div>
  );
}
