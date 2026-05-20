import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { myBookings, cancelBooking } from "@/lib/api.functions";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — LuxeGlow" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const fetchMine = useServerFn(myBookings);
  const cancel = useServerFn(cancelBooking);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);

  const bookings = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => fetchMine(),
    enabled: !!user,
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => { toast.success("Booking cancelled"); qc.invalidateQueries({ queryKey: ["my-bookings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Your Space</span>
          <h1 className="font-display text-4xl mt-2">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome, {user.email}</p>
        </div>
        <Button asChild variant="luxe"><Link to="/book">New Booking</Link></Button>
      </div>

      <h2 className="font-display text-2xl mt-10">My Bookings</h2>
      <div className="grid gap-4 mt-4">
        {bookings.isLoading && <Card className="p-6">Loading…</Card>}
        {bookings.data?.length === 0 && (
          <Card className="p-6 text-muted-foreground">No bookings yet. <Link to="/book" className="text-[var(--color-gold)]">Book one →</Link></Card>
        )}
        {(bookings.data ?? []).map((b: any) => (
          <Card key={b.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg">{b.services?.name ?? "Service"}</h3>
                <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"}>
                  {b.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {new Date(b.appointment_at).toLocaleString()} · {formatPrice(b.services?.price_cents ?? 0)}
              </div>
            </div>
            {b.status !== "cancelled" && b.status !== "completed" && (
              <Button variant="outline" size="sm" onClick={() => cancelMut.mutate(b.id)}>Cancel</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
