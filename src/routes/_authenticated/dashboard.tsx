import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FlaskConical, FolderOpen, Activity, Dna } from "lucide-react";
import { listPatients } from "@/lib/patients.functions";
import { CLASS_IDS, CLASS_INFO, classLabel, type ClassId } from "@/lib/classification";

const patientsQuery = queryOptions({
  queryKey: ["patients"],
  queryFn: () => listPatients(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — OncoClass" },
      { name: "description", content: "Overview of your saved NSCLC mutation classifications." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(patientsQuery),
  component: DashboardPage,
});

const TARGETED_CLASSES: ClassId[] = ["egfr_driven", "alk_driven", "met_altered"];

function DashboardPage() {
  const { data: patients } = useSuspenseQuery(patientsQuery);
  const total = patients.length;

  const byClass = new Map<string, number>();
  for (const p of patients) byClass.set(p.rule_class, (byClass.get(p.rule_class) ?? 0) + 1);
  const distribution = CLASS_IDS.map((id) => ({ id, count: byClass.get(id) ?? 0 })).filter(
    (d) => d.count > 0
  );
  distribution.sort((a, b) => b.count - a.count);

  const targeted = patients.filter((p) => TARGETED_CLASSES.includes(p.rule_class as ClassId)).length;
  const agreement = patients.filter((p) => p.rule_class === p.ml_class).length;
  const agreementRate = total > 0 ? Math.round((agreement / total) * 100) : 0;

  const stats = [
    { icon: FolderOpen, label: "Classified profiles", value: String(total) },
    { icon: FlaskConical, label: "Targeted-therapy patterns", value: String(targeted) },
    { icon: Activity, label: "AI/rule agreement", value: `${agreementRate}%` },
    { icon: Dna, label: "Genes per profile", value: "6" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        An overview of the mutation profiles you have classified.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 font-display text-3xl font-bold text-foreground">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Class distribution
          </h2>
          {total === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No classifications yet — your distribution will appear here after the first profile.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {distribution.map((d) => {
                const pct = Math.round((d.count / total) * 100);
                return (
                  <li key={d.id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-foreground">{classLabel(d.id)}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent profiles
            </h2>
            <Link to="/patients" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {total === 0 ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
              <Link
                to="/classify"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Classify first profile
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {patients.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.patient_label}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.created_at ? format(new Date(p.created_at), "d MMM yyyy") : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                    {classLabel(p.rule_class)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {total > 0 && (
        <p className="mt-6 text-xs text-muted-foreground">
          Most common class: <span className="font-medium text-foreground">{CLASS_INFO[distribution[0]!.id as ClassId]?.label ?? distribution[0]!.id}</span>
        </p>
      )}
    </div>
  );
}
