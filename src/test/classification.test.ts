import { describe, expect, it } from "vitest";
import { classify, classifyRule } from "@/lib/classification";
import { predictProfile } from "@/lib/ml/inference";
import type { GeneProfile, GeneStatus } from "@/lib/mutations";

function profile(over: Partial<Record<string, GeneStatus>> = {}): GeneProfile {
  return {
    egfr: "wildtype",
    kras: "wildtype",
    tp53: "wildtype",
    alk: "wildtype",
    stk11: "wildtype",
    met: "wildtype",
    ...over,
  } as GeneProfile;
}

describe("rule-based classification", () => {
  it("classifies an EGFR-mutant profile with TP53 co-mutation as EGFR-driven", () => {
    const r = classifyRule(profile({ egfr: "mutated", tp53: "mutated" }));
    expect(r.classId).toBe("egfr_driven");
    expect(r.flags).toContain("tp53_comutation");
    expect(r.flags).toContain("tki_candidate");
  });

  it("classifies KRAS + STK11 double mutation as the KRAS/STK11 co-mutation class", () => {
    const r = classifyRule(profile({ kras: "mutated", stk11: "mutated" }));
    expect(r.classId).toBe("kras_stk11");
  });

  it("classifies two driver mutations as complex multi-driver", () => {
    const r = classifyRule(profile({ egfr: "mutated", kras: "mutated" }));
    expect(r.classId).toBe("complex_multidriver");
    expect(r.flags).toContain("multiple_drivers");
  });

  it("classifies a fully wild-type profile as pan-negative", () => {
    const r = classifyRule(profile());
    expect(r.classId).toBe("pan_negative");
    expect(r.flags).not.toContain("incomplete_profile");
  });

  it("flags an incomplete profile when a gene is unknown and no alteration is found", () => {
    const r = classifyRule(profile({ tp53: "unknown" }));
    expect(r.classId).toBe("pan_negative");
    expect(r.flags).toContain("incomplete_profile");
  });

  it("classifies an isolated STK11 mutation as STK11-altered", () => {
    const r = classifyRule(profile({ stk11: "mutated" }));
    expect(r.classId).toBe("stk11_altered");
  });

  it("prioritizes MET over KRAS when both are mutated (single-driver ordering)", () => {
    const r = classifyRule(profile({ met: "mutated", kras: "mutated", stk11: "mutated" }));
    expect(r.classId).toBe("met_altered");
  });
});

describe("AI/ML model", () => {
  it("returns nine class probabilities that sum to 1", () => {
    const ml = predictProfile(profile({ egfr: "mutated" }));
    const values = Object.values(ml.probabilities);
    expect(values).toHaveLength(9);
    const sum = values.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("gives the highest probability to EGFR-driven for an EGFR-mutant profile", () => {
    const ml = predictProfile(profile({ egfr: "mutated" }));
    expect(ml.topClass).toBe("egfr_driven");
    expect(ml.topProb).toBeGreaterThan(0.4);
  });

  it("agrees with the rule engine on a classic KRAS/STK11 profile", () => {
    const c = classify(profile({ kras: "mutated", stk11: "mutated" }));
    expect(c.agreement).toBe("match");
  });
});
