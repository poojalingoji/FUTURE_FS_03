import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Public: list active services
export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Public: create booking with double-book guard + future date check
const bookingSchema = z.object({
  service_id: z.string().uuid(),
  customer_name: z.string().trim().min(2).max(100),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().trim().min(7).max(20),
  appointment_at: z.string().min(1),
  notes: z.string().max(500).optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const when = new Date(data.appointment_at);
    if (Number.isNaN(when.getTime()) || when <= new Date()) {
      throw new Error("Please pick a future date and time.");
    }
    // double-booking check
    const { data: existing } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("service_id", data.service_id)
      .eq("appointment_at", when.toISOString())
      .neq("status", "cancelled")
      .maybeSingle();
    if (existing) throw new Error("That time slot is no longer available. Please pick another.");

    const { data: inserted, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        service_id: data.service_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        appointment_at: when.toISOString(),
        notes: data.notes ?? null,
        user_id: data.user_id ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

// User bookings
export const myBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, services(name, category, price_cents)")
      .eq("user_id", context.userId)
      .order("appointment_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Reviews public + submit
export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      customer_name: z.string().trim().min(2).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(5).max(1000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("reviews").insert({ ...data, is_approved: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Customer queries
const querySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional().nullable(),
  question: z.string().trim().min(10).max(1000),
});

export const submitQuery = createServerFn({ method: "POST" })
  .inputValidator((d) => querySchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("customer_queries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      question: data.question,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listPublicQueries = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("customer_queries")
    .select("id, name, question, owner_reply, created_at")
    .eq("is_public", true)
    .eq("status", "answered")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Contact
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(200),
      phone: z.string().trim().max(20).optional().nullable(),
      message: z.string().trim().min(5).max(2000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("contact_messages").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Admin metrics + management
async function ensureAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin")) throw new Error("Forbidden: admin only");
}

export const adminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [{ count: totalBookings }, { count: todayBookings }, { count: pendingQueries }, { count: reviewsCount }, { data: revenueRows }] = await Promise.all([
      supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }).gte("appointment_at", today.toISOString()),
      supabaseAdmin.from("customer_queries").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("bookings").select("services(price_cents)").neq("status", "cancelled"),
    ]);
    const revenue = (revenueRows ?? []).reduce((s: number, r: any) => s + (r.services?.price_cents ?? 0), 0);
    return {
      totalBookings: totalBookings ?? 0,
      todayBookings: todayBookings ?? 0,
      pendingQueries: pendingQueries ?? 0,
      reviewsCount: reviewsCount ?? 0,
      revenueCents: revenue,
    };
  });

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*, services(name)")
      .order("appointment_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await supabaseAdmin.from("bookings").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListQueries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("customer_queries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminReplyQuery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      reply: z.string().trim().min(2).max(2000),
      is_public: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await supabaseAdmin
      .from("customer_queries")
      .update({ owner_reply: data.reply, status: "answered", is_public: data.is_public })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteQuery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await supabaseAdmin.from("customer_queries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
