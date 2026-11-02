import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Dna,
  FlaskConical,
  BrainCircuit,
  FolderOpen,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import heroImg from "@/assets/hero-genomics.jpg";
import { CLASS_IDS, CLASS_INFO } from "@/lib/classification";
import { GENES, GENE_INFO } from "@/lib/mutations";
import { MODEL_INFO } from "@/lib/ml/inference";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OncoClass — Multigene Mutation Classification" },
      {
        name: "description",
        content:
          "Classify NSCLC patient mutation profiles across EGFR, KRAS, TP53, ALK, STK11 and MET — rule-based classes, clinical hints and an AI/ML model.",
      },
      { property: "og:title", content: "OncoClass — Multigene Mutation Classification" },
      {
        property: "og:description",
        content:
          "Classify NSCLC patient mutation profiles across six genes with rule-based classes, clinical hints and an AI/ML model.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: FlaskConical,
    title: "1. Enter the mutation profile",
    text: "Mark each panel gene — EGFR, KRAS, TP53, ALK, STK11, MET — as mutated, wild-type or unknown, straight from the molecular report.",
  },
  {
    icon: Dna,
    title: "2. Rule-based classification",
    text: "A clinically grounded rule engine assigns the profile to one of nine co-mutation classes and surfaces treatment-relevance flags.",
  },
  {
    icon: BrainCircuit,
    title: "3. AI/ML second opinion",
    text: "A trained multinomial logistic-regression model scores the profile and returns class probabilities, so you can see agreement or divergence.",
  },
] as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dna className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            OncoClass
          </span>
        </div>
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:pt-14">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {GENES.join(" · ")}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Multigene mutation classification for NSCLC profiles
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Enter a patient's mutation profile across six key genes. OncoClass assigns the
            co-mutation class, flags treatment-relevant patterns, and runs an AI/ML model as a
            second reader — with every classified profile saved to your records.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start classifying
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-muted-foreground">
              Free · sign-up takes less than a minute
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {GENES.map((g) => (
              <span
                key={g}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {GENE_INFO[g].name}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/5">
          <img
            src={heroImg}
            alt="Stylized DNA helix across a gene panel grid"
            width={1536}
            height={1024}
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="border-t border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            How it works
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Nine profile classes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every profile maps to one co-mutation class, from single-driver to pan-negative.
            </p>
          </div>
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {MODEL_INFO.type} · {MODEL_INFO.holdoutAccuracy * 100}% holdout accuracy
          </span>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CLASS_IDS.map((id) => (
            <div
              key={id}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <p className="font-display text-sm font-semibold text-foreground">
                {CLASS_INFO[id].label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {CLASS_INFO[id].description}
              </p>
            </div>
          ))}
          <div className="flex items-center rounded-xl border border-primary/30 bg-primary/5 p-4">
            <FolderOpen className="mr-3 h-5 w-5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-foreground">
              Every classification is saved to your private patient records for follow-up.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-start">
          <ShieldAlert className="h-5 w-5 shrink-0 text-accent-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            OncoClass is a research and educational tool for exploring multigene mutation
            patterns. It is not a medical device, does not diagnose disease, and its output must
            never guide treatment decisions. Treatment selection requires variant-level
            confirmation and review by a qualified oncologist or molecular tumor board.
          </p>
        </div>
      </footer>
    </div>
  );
}
