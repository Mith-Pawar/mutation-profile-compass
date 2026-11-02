import { GENES, GENE_INFO, type GeneKey, type GeneProfile, type GeneStatus } from "@/lib/mutations";
import { cn } from "@/lib/utils";

const OPTIONS: { value: GeneStatus; label: string }[] = [
  { value: "mutated", label: "Mutated" },
  { value: "wildtype", label: "Wild-type" },
  { value: "unknown", label: "Unknown" },
];

interface GenePickerProps {
  value: GeneProfile;
  onChange: (profile: GeneProfile) => void;
}

export function GenePicker({ value, onChange }: GenePickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {GENES.map((gene: GeneKey) => (
        <div key={gene} className="rounded-xl border border-border bg-background p-3.5">
          <p className="font-display text-sm font-semibold text-foreground">
            {GENE_INFO[gene].name}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {GENE_INFO[gene].role}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
            {OPTIONS.map((opt) => {
              const selected = value[gene] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ ...value, [gene]: opt.value })}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                    selected
                      ? opt.value === "mutated"
                        ? "bg-mutated text-mutated-foreground shadow-sm"
                        : opt.value === "wildtype"
                          ? "bg-wildtype text-wildtype-foreground shadow-sm"
                          : "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
