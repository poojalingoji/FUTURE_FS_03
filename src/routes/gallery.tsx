import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — LuxeGlow Salon & Spa" },
      { name: "description", content: "A look inside the LuxeGlow studio and our craft." },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

const items = [
  { src: g1, cat: "Hair" },
  { src: g2, cat: "Skin" },
  { src: g3, cat: "Nails" },
  { src: g4, cat: "Spa" },
  { src: hero, cat: "Studio" },
  { src: g1, cat: "Hair" },
  { src: g2, cat: "Skin" },
  { src: g4, cat: "Spa" },
];

function Gallery() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const cats = ["All", "Hair", "Skin", "Nails", "Spa", "Studio"];
  const filtered = items.filter((i) => filter === "All" || i.cat === filter);

  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Visual Diary</span>
      <h1 className="font-display text-5xl mt-2">Gallery</h1>
      <div className="flex flex-wrap gap-2 mt-8">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${filter === c ? "gradient-gold text-ink border-transparent" : "border-border hover:border-[var(--color-gold)]"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mt-10 space-y-4">
        {filtered.map((it, i) => (
          <button key={i} onClick={() => setOpen(it.src)} className="block w-full break-inside-avoid rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
            <img src={it.src} alt={it.cat} className="w-full h-auto" loading="lazy" />
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setOpen(null)}>
          <img src={open} alt="" className="max-h-[90vh] max-w-[90vw] rounded-lg" />
        </div>
      )}
    </div>
  );
}
