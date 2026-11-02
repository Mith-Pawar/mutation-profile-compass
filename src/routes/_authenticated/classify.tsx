import { createFileRoute, Link } from "@tanstack/react-router";
import { Dna } from "lucide-react";
import { GenePicker } from "@/components/gene-picker";
import { ClassBadge, StatusChip, MlProbabilityBars, FlagChip } from "@/components/classification-ui";
import { classify } from "@/lib/classification";
import { emptyProfile, type GeneProfile } from "@/lib/mutations";
import { savePatient } from "@/lib/patients.functions";

export const Route = createFileRoute("/_authenticated/classify")({
  head: () => ({
    meta: [
      { title: "New classification — OncoClass" },
      {
        name: "description",
        content: "Enter a six-gene mutation profile and classify it with the rule engine and AI/ML model.",
      },
    ],
  }),
  component: ClassifyPage,
});

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { PatientInput } from "@/lib/patients.functions";

function ClassifyPage() {
  const [profile, setProfile] = useState<GeneProfile>(emptyProfile);
  const [label, setLabel] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<PatientInput["sex"]>("unknown");
  const [smoking, setSmoking] = useState<PatientInput["smoking_status"]>("unknown");
  const [specimenDate, setSpecimenDate] = useState("");
  const [notes, setNotes] = useState("");

  const result = classify(profile);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const saveMutation = useMutation({
    mutationFn: (input: PatientInput) => savePatient({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient record saved", {
        description: `${label.trim()} is now in your records.`,
      });
      navigate({ to: "/patients" });
    },
    onError: (error) => {
      toast.error("Could not save the record", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const labelValid = label.trim().length > 0;

  const handleSave = () => {
    if (!labelValid) return;
    saveMutation.mutate({
      patient_label: label.trim(),
      age: age === "" ? null : Number(age),
      sex,
      smoking_status: smoking,
      specimen_date: specimenDate === "" ? null : specimenDate,
      profile,
      rule_class: result.rule.classId,
      rule_flags: result.rule.flags,
      ml_class: result.ml.topClass,
      ml_probabilities: result.ml.probabilities,
      clinical_hints: result.hints,
      notes: notes.trim() === "" ? null : notes.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            New classification
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark each gene from the molecular report. Results update live as you go.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!labelValid || saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save to records
        </button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Patient details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="patient-label" className="text-xs font-medium text-foreground">
                  Patient label (anonymized ID) *
                </label>
                <input
                  id="patient-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. PT-047"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="patient-age" className="text-xs font-medium text-foreground">
                  Age
                </label>
                <input
                  id="patient-age"
                  type="number"
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="—"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="patient-sex" className="text-xs font-medium text-foreground">
                  Sex
                </label>
                <select
                  id="patient-sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as PatientInput["sex"])}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="unknown">Unknown</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="patient-smoking" className="text-xs font-medium text-foreground">
                  Smoking status
                </label>
                <select
                  id="patient-smoking"
                  value={smoking}
                  onChange={(e) => setSmoking(e.target.value as PatientInput["smoking_status"])}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="unknown">Unknown</option>
                  <option value="never">Never</option>
                  <option value="former">Former</option>
                  <option value="current">Current</option>
                </select>
              </div>
              <div>
                <label htmlFor="patient-date" className="text-xs font-medium text-foreground">
                  Specimen date
                </label>
                <input
                  id="patient-date"
                  type="date"
                  value={specimenDate}
                  onChange={(e) => setSpecimenDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="patient-notes" className="text-xs font-medium text-foreground">
                  Notes
                </label>
                <textarea
                  id="patient-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Optional context — histology, variant-level details, report reference…"
                  className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mutation profile
            </h2>
            <div className="mt-4">
              <GenePicker value={profile} onChange={setProfile} />
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Rule-based class
                </h2>
                <p className="mt-2 font-display text-2xl font-bold text-foreground">
                  <ClassBadge classId={result.rule.classId} large />
                </p>
              </div>
              <span
                className={
                  result.agreement === "match"
                    ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    : "rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
                }
              >
                {result.agreement === "match" ? "AI agrees" : "AI divergent"}
              </span>
            </div>
            {result.rule.flags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.rule.flags.map((f) => (
                  <FlagChip key={f} flag={f} />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                AI/ML model probabilities
              </h2>
              <span className="text-xs font-medium text-muted-foreground">
                top: {(result.ml.topProb * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-4">
              <MlProbabilityBars probabilities={result.ml.probabilities} highlight={result.rule.classId} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Clinical hints
            </h2>
            <ul className="mt-4 space-y-2.5">
              {result.hints.map((hint, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {hint}
                </li>
              ))}
            </ul>
          </section>

          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            Research and educational use only — not a medical device and not medical advice.
            Variant-level confirmation and oncologist review are required before any treatment
            decision.
          </p>
        </div>
      </div>
    </div>
  );
}
