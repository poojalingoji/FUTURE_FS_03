import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listServices, createBooking } from "@/lib/api.functions";
import { formatPrice } from "@/lib/site";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2 } from "lucide-react";

const search = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/book")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Book Appointment — LuxeGlow Salon & Spa" },
      { name: "description", content: "Reserve your luxury salon and spa appointment online." },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

function BookPage() {
  const { service: preselected } = Route.useSearch();
  const { user } = useAuth();
  const fetchServices = useServerFn(listServices);
  const create = useServerFn(createBooking);
  const services = useQuery({ queryKey: ["services"], queryFn: () => fetchServices() });
  const [confirmed, setConfirmed] = useState(false);

  const [form, setForm] = useState({
    service_id: preselected ?? "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (preselected && !form.service_id) setForm((f) => ({ ...f, service_id: preselected }));
  }, [preselected]);

  const mut = useMutation({
    mutationFn: async () => {
      if (!form.service_id) throw new Error("Please select a service");
      if (!form.date || !form.time) throw new Error("Please pick a date and time");
      const appointment_at = new Date(`${form.date}T${form.time}:00`).toISOString();
      return create({
        data: {
          service_id: form.service_id,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          appointment_at,
          notes: form.notes || null,
          user_id: user?.id ?? null,
        },
      });
    },
    onSuccess: () => { setConfirmed(true); toast.success("Booking received! We'll confirm shortly."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  if (confirmed) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-24 max-w-xl text-center">
        <CheckCircle2 className="h-16 w-16 mx-auto text-[var(--color-gold)]" />
        <h1 className="font-display text-4xl mt-6">You're booked in</h1>
        <p className="mt-3 text-muted-foreground">A confirmation will be sent to {form.customer_email}. See you soon!</p>
        <Button variant="luxe" className="mt-8" onClick={() => { setConfirmed(false); setForm({ ...form, date: "", time: "", notes: "" }); }}>
          Book another
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-2xl">
      <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Reserve</span>
      <h1 className="font-display text-5xl mt-2">Book an Appointment</h1>

      <Card className="mt-10 p-6 md:p-8 space-y-5">
        <div>
          <Label>Service</Label>
          <Select value={form.service_id} onValueChange={(v) => setForm({ ...form, service_id: v })}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="Select a service" /></SelectTrigger>
            <SelectContent>
              {(services.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — {formatPrice(s.price_cents)} · {s.duration_minutes}m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Date</Label><Input type="date" min={minDate} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2" /></div>
          <div><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-2" /></div>
        </div>
        <div><Label>Full Name</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="mt-2" /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Email</Label><Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="mt-2" /></div>
          <div><Label>Phone</Label><Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="mt-2" /></div>
        </div>
        <div><Label>Notes (optional)</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2" /></div>
        <Button variant="luxe" size="lg" className="w-full" disabled={mut.isPending} onClick={() => mut.mutate()}>
          {mut.isPending ? "Booking…" : "Confirm Booking"}
        </Button>
      </Card>
    </div>
  );
}
