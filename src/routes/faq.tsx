import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { listPublicQueries, submitQuery } from "@/lib/api.functions";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — LuxeGlow Salon & Spa" },
      { name: "description", content: "Answers to common questions, and submit your own." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQ,
});

const STATIC_FAQ = [
  { q: "Do I need to book in advance?", a: "Yes — weekends fill quickly. Book online or via WhatsApp." },
  { q: "What products do you use?", a: "We work exclusively with premium professional brands like Olaplex, Kérastase and Dermalogica." },
  { q: "Do you offer bridal packages?", a: "Yes, our bridal team can build a fully customised package. Contact us for a quote." },
  { q: "Is parking available?", a: "Valet parking is complimentary for all guests." },
  { q: "Can I cancel my booking?", a: "Yes, up to 24 hours before your appointment via your dashboard." },
];

function FAQ() {
  const listQ = useServerFn(listPublicQueries);
  const submit = useServerFn(submitQuery);
  const public_qs = useQuery({ queryKey: ["public-queries"], queryFn: () => listQ() });

  const [form, setForm] = useState({ name: "", email: "", phone: "", question: "" });

  const mut = useMutation({
    mutationFn: () => submit({ data: { ...form, phone: form.phone || null } }),
    onSuccess: () => {
      toast.success("Question received — we'll reply soon.");
      setForm({ name: "", email: "", phone: "", question: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Help</span>
      <h1 className="font-display text-5xl mt-2">Frequently Asked</h1>

      <Accordion type="single" collapsible className="mt-8">
        {STATIC_FAQ.map((f, i) => (
          <AccordionItem key={i} value={`s-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {(public_qs.data ?? []).length > 0 && (
        <>
          <div className="hairline-divider my-12" />
          <h2 className="font-display text-3xl">From Our Guests</h2>
          <Accordion type="single" collapsible className="mt-4">
            {(public_qs.data ?? []).map((q) => (
              <AccordionItem key={q.id} value={q.id}>
                <AccordionTrigger className="text-left">{q.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">{q.owner_reply}</p>
                  <div className="text-xs text-muted-foreground mt-2">— Asked by {q.name} · {new Date(q.created_at).toLocaleDateString()}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}

      <div className="hairline-divider my-12" />
      <h2 className="font-display text-3xl">Still Have Questions? Ask Us</h2>
      <Card className="p-6 mt-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" /></div>
        </div>
        <div><Label>Phone (optional)</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2" /></div>
        <div>
          <Label>Your Question <span className="text-muted-foreground text-xs">({form.question.length}/1000)</span></Label>
          <Textarea rows={4} maxLength={1000} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="mt-2" />
        </div>
        <Button variant="luxe" className="w-full" disabled={mut.isPending} onClick={() => mut.mutate()}>
          {mut.isPending ? "Sending…" : "Submit Question"}
        </Button>
      </Card>
    </div>
  );
}
