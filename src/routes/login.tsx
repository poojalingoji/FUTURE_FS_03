import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — LuxeGlow" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <Card className="p-8">
        <h1 className="font-display text-3xl text-center">Welcome Back</h1>
        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" /></div>
          <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" /></div>
          <Button type="submit" variant="luxe" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</Button>
        </form>
        <p className="text-sm text-center mt-6 text-muted-foreground">
          New here? <Link to="/register" className="text-[var(--color-gold)] hover:underline">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
