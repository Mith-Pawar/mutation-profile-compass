import { CLASS_INFO, FLAGS, classLabel, type ClassId, type FlagId } from "@/lib/classification";
import { cn } from "@/lib/utils";
import type { GeneStatus } from "@/lib/mutations";

export function ClassBadge({ classId, large }: { classId: string; large?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-primary/10 font-semibold text-primary",
        large ? "px-4 py-1.5 text-xl" : "px-3 py-1 text-xs"
      )}
    >
      {classLabel(classId)}
    </span>
  );
}

export function FlagChip({ flag }: { flag: string }) {
  return (
    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
      {FLAGS[flag as FlagId] ?? flag}
    </span>
  );
}

export function StatusChip({ status }: { status: GeneStatus }) {
  if (status === "mutated") {
    return (
      <span className="inline-block rounded-full bg-mutated/10 px-2 py-0.5 text-xs font-semibold text-mutated">
        Mutated
      </span>
    );
  }
  if (status === "wildtype") {
    return (
      <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-wildtype">
        Wild-type
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full border border-dashed border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Unknown
    </span>
  );
}

export function MlProbabilityBars({
  probabilities,
  highlight,
}: {
  probabilities: Record<string, number>;
  highlight?: string;
}) {
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  return (
    <ul className="space-y-2">
      {entries.map(([classId, prob]) => {
        const pct = Math.round(prob * 100);
        const isHighlight = classId === highlight;
        return (
          <li key={classId} className="flex items-center gap-3">
            <span
              className={cn(
                "w-40 shrink-0 truncate text-xs",
                isHighlight ? "font-semibold text-primary" : "text-muted-foreground"
              )}
            >
              {CLASS_INFO[classId as ClassId]?.label ?? classId}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", isHighlight ? "bg-primary" : "bg-muted-foreground/40")}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span
              className={cn(
                "w-12 shrink-0 text-right text-xs tabular-nums",
                isHighlight ? "font-semibold text-primary" : "text-muted-foreground"
              )}
            >
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
