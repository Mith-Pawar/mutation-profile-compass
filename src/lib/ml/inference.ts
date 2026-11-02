import { MODEL_WEIGHTS as W } from "./model-weights";
import { GENES, type GeneProfile } from "@/lib/mutations";

// Feature layout must match tools/train_ml_model.py exactly:
// 6 mutated indicators, 6 unknown indicators, then 6 pairwise co-mutation terms.
const PAIR_GENES: [number, number][] = [
  [1, 4], // KRAS x STK11
  [2, 0], // TP53 x EGFR
  [2, 1], // TP53 x KRAS
  [2, 3], // TP53 x ALK
  [2, 5], // TP53 x MET
  [4, 5], // STK11 x MET
];

export function buildFeatureVector(profile: GeneProfile): number[] {
  const mut = GENES.map((g) => (profile[g] === "mutated" ? 1 : 0));
  const unk = GENES.map((g) => (profile[g] === "unknown" ? 1 : 0));
  const pairs = PAIR_GENES.map(([a, b]) => mut[a]! * mut[b]!);
  return [...mut, ...unk, ...pairs];
}

export interface MlPrediction {
  probabilities: Record<string, number>;
  topClass: string;
  topProb: number;
}

export function predictProfile(profile: GeneProfile): MlPrediction {
  const x = buildFeatureVector(profile);
  const scores = W.classes.map((_, ci) => {
    const row = W.coefficients[ci]!;
    const bias = W.intercepts[ci]!;
    return bias + row.reduce((sum, w, j) => sum + w * x[j]!, 0);
  });
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const total = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / total);

  const probabilities: Record<string, number> = {};
  W.classes.forEach((cls, i) => {
    probabilities[cls] = probs[i]!;
  });
  const topIdx = probs.indexOf(Math.max(...probs));
  return { probabilities, topClass: W.classes[topIdx]!, topProb: probs[topIdx]! };
}

export const MODEL_INFO = {
  type: "Multinomial logistic regression",
  classes: W.classes.length,
  holdoutAccuracy: W.holdout_accuracy,
} as const;
