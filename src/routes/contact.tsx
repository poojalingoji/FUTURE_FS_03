import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { submitContact } from "@/lib/api.functions";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LuxeGlow Salon & Spa" },
      { name: "description", content: "Visit, call, or message LuxeGlow Salon & Spa." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const submit = useServerFn(submitContact);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const mut = useMutation({
    mutationFn: () => submit({ data: { ...form, phone: form.phone || null } }),
    onSuccess: () => { toast.success("Message sent! We'll be in touch."); setForm({ name: "", email: "", phone: "", message: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  // Universal OpenStreetMap embed — no API key, no blocking
  const mapSrc = "https://www.openstreetmap.org/export/embed.html?bbox=72.819%2C18.935%2C72.829%2C18.945&layer=mapnik&marker=18.940%2C72.824";

  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Visit Us</span>
      <h1 className="font-display text-5xl mt-2">Get in Touch</h1>

      <div className="grid lg:grid-cols-2 gap-10 mt-10">
        <Card className="p-6 md:p-8 space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2" /></div>
          </div>
          <div><Label>Message</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2" /></div>
          <Button variant="luxe" size="lg" className="w-full" disabled={mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? "Sending…" : "Send Message"}
          </Button>
        </Card>

        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
            <iframe
              title="LuxeGlow location"
              src={mapSrc}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex gap-3"><MapPin className="h-5 w-5 text-[var(--color-gold)] shrink-0" /><span>{SITE.address}</span></div>
            <div className="flex gap-3"><Phone className="h-5 w-5 text-[var(--color-gold)] shrink-0" /><a href={`tel:${SITE.phone}`} className="hover:underline">{SITE.phone}</a></div>
            <div className="flex gap-3"><Mail className="h-5 w-5 text-[var(--color-gold)] shrink-0" /><a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a></div>
            <Button asChild variant="luxe" className="w-full">
              <a href={waLink()} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
