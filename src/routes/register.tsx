import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account — LuxeGlow" }] }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.name, phone: form.phone },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email to confirm.");
    nav({ to: "/login" });
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <Card className="p-8">
        <h1 className="font-display text-3xl text-center">Create Your Account</h1>
        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div><Label>Full Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" /></div>
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2" /></div>
          <div><Label>Password</Label><Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2" /></div>
          <Button type="submit" variant="luxe" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create Account"}</Button>
        </form>
        <p className="text-sm text-center mt-6 text-muted-foreground">
          Already have an account? <Link to="/login" className="text-[var(--color-gold)] hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
