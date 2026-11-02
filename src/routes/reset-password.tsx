import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — OncoClass" },
      { name: "description", content: "Set a new password for your OncoClass account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Supabase puts the recovery payload in the URL hash (#access_token=…&type=recovery).
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const isRecovery = hash.includes("type=recovery");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
      toast.success("Password updated", { description: "You can now sign in with your new password." });
      setTimeout(() => navigate({ to: "/auth" }), 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-lg shadow-primary/5">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Set a new password</h1>
        </div>

        {!isRecovery ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            This link is not a valid password-reset link. Please request a new one from the{" "}
            <Link to="/auth" className="font-medium text-primary hover:underline">
              sign-in page
            </Link>
            .
          </p>
        ) : done ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Password updated. Taking you to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label htmlFor="new-password" className="text-xs font-medium text-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
