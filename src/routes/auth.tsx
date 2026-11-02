import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dna, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — OncoClass" },
      { name: "description", content: "Sign in to OncoClass to classify and save NSCLC mutation profiles." },
    ],
  }),
  component: AuthPage,
});

function safeNext(search: string): string {
  const next = new URLSearchParams(search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (awaitingConfirmation) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: safeNext(window.location.search) });
    });
    return () => data.subscription.unsubscribe();
  }, [awaitingConfirmation, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error("Sign-in failed", { description: error.message });
          return;
        }
        navigate({ to: safeNext(window.location.search) });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          toast.error("Sign-up failed", { description: error.message });
          return;
        }
        if (data.session) {
          navigate({ to: safeNext(window.location.search) });
        } else {
          setAwaitingConfirmation(true);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: "google" | "lovable") => {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Sign-in failed", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    navigate({ to: safeNext(window.location.search) });
  };

  if (awaitingConfirmation) {
    return (
      <AuthShell>
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Dna className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <button
            type="button"
            onClick={() => setAwaitingConfirmation(false)}
            className="mt-5 text-sm font-medium text-primary hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Dna className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold text-foreground">
          {mode === "signin" ? "Sign in to OncoClass" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Access your saved mutation classifications."
            : "Start classifying NSCLC mutation profiles in minutes."}
        </p>
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.9h5.35c-.25 1.5-1.75 4.4-5.35 4.4-3.2 0-5.8-2.65-5.8-5.9S8.8 6.6 12 6.6c1.8 0 3.05.75 3.75 1.4l2.55-2.45C16.7 3.95 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.6-.1-1.05-.3-1.1Z"
            />
          </svg>
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("lovable")}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          Continue with Lovable
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or use email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label htmlFor="auth-email" className="text-xs font-medium text-foreground">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="text-xs font-medium text-foreground">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {mode === "signin" && (
            <Link
              to="/reset-password"
              className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New to OncoClass?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="inline-flex items-center font-medium text-primary hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-lg shadow-primary/5">
        {children}
      </div>
    </div>
  );
}
