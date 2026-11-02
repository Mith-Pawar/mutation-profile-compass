import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Trash2 } from "lucide-react";
import { listPatients, deletePatient } from "@/lib/patients.functions";
import { classLabel, FLAGS, type ClassId, type FlagId } from "@/lib/classification";
import { GENES, GENE_INFO, type GeneStatus } from "@/lib/mutations";
import { MlProbabilityBars, StatusChip } from "@/components/classification-ui";
import { cn } from "@/lib/utils";

const patientsQuery = queryOptions({
  queryKey: ["patients"],
  queryFn: () => listPatients(),
});

export const Route = createFileRoute("/_authenticated/patients")({
  head: () => ({
    meta: [
      { title: "Patient records — OncoClass" },
      { name: "description", content: "Browse, review and manage your saved mutation classifications." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(patientsQuery),
  component: PatientsPage,
});

function PatientsPage() {
  const { data: patients } = useSuspenseQuery(patientsQuery);
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePatient({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Record deleted");
    },
    onError: (error) => {
      toast.error("Could not delete the record", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        Patient records
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {patients.length === 0
          ? "No records yet."
          : `${patients.length} saved classification${patients.length === 1 ? "" : "s"} — click a row to expand.`}
      </p>

      <ul className="mt-6 space-y-3">
        {patients.map((p) => {
          const expanded = expandedId === p.id;
          const agrees = p.rule_class === p.ml_class;
          return (
            <li
              key={p.id}
              className="overflow-hidden rounded-2xl border border-border bg-card transition-colors"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : p.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-semibold text-foreground">
                      {p.patient_label}
                    </span>
                    {p.sex !== "unknown" && (
                      <span className="text-xs capitalize text-muted-foreground">{p.sex}</span>
                    )}
                    {p.age !== null && (
                      <span className="text-xs text-muted-foreground">{p.age}y</span>
                    )}
                    {p.smoking_status !== "unknown" && (
                      <span className="text-xs capitalize text-muted-foreground">
                        · {p.smoking_status} smoker
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.created_at ? format(new Date(p.created_at), "d MMM yyyy, HH:mm") : ""}
                  </p>
                </div>
                <span className="hidden shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline">
                  {classLabel(p.rule_class)}
                </span>
                <span
                  className={cn(
                    "hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold md:inline",
                    agrees ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
                  )}
                >
                  {agrees ? "AI agrees" : "AI divergent"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </button>

              {expanded && (
                <div className="border-t border-border px-5 py-5">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Gene status
                      </h3>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {GENES.map((g) => (
                          <div
                            key={g}
                            className="rounded-lg border border-border bg-background px-3 py-2"
                          >
                            <p className="text-xs font-medium text-foreground">
                              {GENE_INFO[g].name}
                            </p>
                            <div className="mt-1">
                              <StatusChip status={p[g] as GeneStatus} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {p.rule_flags.length > 0 && (
                        <>
                          <h3 className="mt-5 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Flags
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {p.rule_flags.map((f) => (
                              <span
                                key={f}
                                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                              >
                                {FLAGS[f as FlagId] ?? f}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {p.notes && (
                        <>
                          <h3 className="mt-5 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Notes
                          </h3>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {p.notes}
                          </p>
                        </>
                      )}

                      <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          Class:{" "}
                          <span className="font-medium text-foreground">
                            {classLabel(p.rule_class)}
                          </span>
                        </span>
                        {p.specimen_date && <span>Specimen: {p.specimen_date}</span>}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        AI/ML model probabilities
                      </h3>
                      <div className="mt-3">
                        <MlProbabilityBars
                          probabilities={p.ml_probabilities}
                          highlight={p.rule_class}
                        />
                      </div>

                      {p.clinical_hints.length > 0 && (
                        <>
                          <h3 className="mt-5 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Clinical hints
                          </h3>
                          <ul className="mt-3 space-y-2">
                            {p.clinical_hints.map((hint, i) => (
                              <li
                                key={i}
                                className="flex gap-2.5 text-sm leading-relaxed text-foreground"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {hint}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete record "${p.patient_label}"? This cannot be undone.`)) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-3.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete record
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
