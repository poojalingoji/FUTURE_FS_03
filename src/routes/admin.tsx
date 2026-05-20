import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { adminMetrics, adminListBookings, adminUpdateBookingStatus, adminListQueries, adminReplyQuery, adminDeleteQuery } from "@/lib/api.functions";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/site";
import { Calendar, MessageSquare, Star, IndianRupee, Clock } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — LuxeGlow" }] }),
  component: Admin,
});

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) nav({ to: "/login" });
  }, [loading, user, isAdmin, nav]);

  const metricsFn = useServerFn(adminMetrics);
  const bookingsFn = useServerFn(adminListBookings);
  const queriesFn = useServerFn(adminListQueries);
  const updateBooking = useServerFn(adminUpdateBookingStatus);
  const reply = useServerFn(adminReplyQuery);
  const del = useServerFn(adminDeleteQuery);

  const metrics = useQuery({ queryKey: ["admin-metrics"], queryFn: () => metricsFn(), enabled: !!user && isAdmin });
  const bookings = useQuery({ queryKey: ["admin-bookings"], queryFn: () => bookingsFn(), enabled: !!user && isAdmin });
  const queries = useQuery({ queryKey: ["admin-queries"], queryFn: () => queriesFn(), enabled: !!user && isAdmin });

  const updateBookingMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "confirmed" | "cancelled" | "completed" }) => updateBooking({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-bookings"] }); qc.invalidateQueries({ queryKey: ["admin-metrics"] }); toast.success("Updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const replyMut = useMutation({
    mutationFn: (v: { id: string; reply: string; is_public: boolean }) => reply({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-queries"] }); toast.success("Reply sent"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-queries"] }); toast.success("Deleted"); },
  });

  if (!user || !isAdmin) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Admin access required.</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Control Center</span>
      <h1 className="font-display text-4xl mt-2">Admin Dashboard</h1>

      {/* metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
        {[
          { l: "Total Bookings", v: metrics.data?.totalBookings ?? "—", i: Calendar },
          { l: "Today", v: metrics.data?.todayBookings ?? "—", i: Clock },
          { l: "Pending Queries", v: metrics.data?.pendingQueries ?? "—", i: MessageSquare },
          { l: "Reviews", v: metrics.data?.reviewsCount ?? "—", i: Star },
          { l: "Revenue", v: metrics.data ? formatPrice(metrics.data.revenueCents) : "—", i: IndianRupee },
        ].map((m) => (
          <Card key={m.l} className="p-5">
            <m.i className="h-5 w-5 text-[var(--color-gold)]" />
            <div className="font-display text-2xl mt-3">{m.v}</div>
            <div className="text-xs text-muted-foreground">{m.l}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bookings" className="mt-10">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="queries">Customer Queries</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6 space-y-3">
          {(bookings.data ?? []).map((b: any) => (
            <Card key={b.id} className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="flex-1">
                <div className="font-display text-lg">{b.services?.name}</div>
                <div className="text-sm text-muted-foreground">{b.customer_name} · {b.customer_email} · {b.customer_phone}</div>
                <div className="text-sm mt-1">{new Date(b.appointment_at).toLocaleString()}</div>
              </div>
              <Badge>{b.status}</Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="luxe" onClick={() => updateBookingMut.mutate({ id: b.id, status: "confirmed" })}>Confirm</Button>
                <Button size="sm" variant="outline" onClick={() => updateBookingMut.mutate({ id: b.id, status: "completed" })}>Complete</Button>
                <Button size="sm" variant="outline" onClick={() => updateBookingMut.mutate({ id: b.id, status: "cancelled" })}>Cancel</Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="queries" className="mt-6 space-y-3">
          {(queries.data ?? []).map((q: any) => <QueryRow key={q.id} q={q} onReply={(reply, is_public) => replyMut.mutate({ id: q.id, reply, is_public })} onDelete={() => delMut.mutate(q.id)} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QueryRow({ q, onReply, onDelete }: { q: any; onReply: (r: string, p: boolean) => void; onDelete: () => void }) {
  const [reply, setReply] = useState(q.owner_reply ?? "");
  const [isPublic, setIsPublic] = useState(q.is_public ?? true);
  return (
    <Card className="p-5">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-medium">{q.name} <span className="text-xs text-muted-foreground">· {q.email}</span></div>
          <p className="mt-2">{q.question}</p>
        </div>
        <Badge variant={q.status === "answered" ? "default" : "secondary"}>{q.status}</Badge>
      </div>
      <Textarea rows={2} placeholder="Your reply…" className="mt-3" value={reply} onChange={(e) => setReply(e.target.value)} />
      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Show publicly on FAQ
        </label>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="luxe" disabled={!reply.trim()} onClick={() => onReply(reply, isPublic)}>Send Reply</Button>
          <Button size="sm" variant="outline" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </Card>
  );
}
