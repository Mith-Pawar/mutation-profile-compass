import { GENES, type GeneKey, type GeneProfile } from "./mutations";
import { predictProfile, type MlPrediction } from "./ml/inference";

export const CLASS_IDS = [
  "egfr_driven",
  "kras_driven",
  "kras_stk11",
  "alk_driven",
  "met_altered",
  "stk11_altered",
  "tp53_dominant",
  "complex_multidriver",
  "pan_negative",
] as const;

export type ClassId = (typeof CLASS_IDS)[number];

export const CLASS_INFO: Record<ClassId, { label: string; description: string }> = {
  egfr_driven: {
    label: "EGFR-driven",
    description: "EGFR mutation dominates the profile; TP53 is a common co-mutation.",
  },
  kras_driven: {
    label: "KRAS-driven",
    description: "KRAS mutation present without STK11 co-mutation.",
  },
  kras_stk11: {
    label: "KRAS / STK11 co-mutated",
    description: "KRAS mutation with concurrent STK11 loss.",
  },
  alk_driven: {
    label: "ALK-rearranged",
    description: "ALK alteration detected — typically a fusion/rearrangement.",
  },
  met_altered: {
    label: "MET-altered",
    description: "MET alteration detected — e.g. exon 14 skipping or amplification.",
  },
  stk11_altered: {
    label: "STK11-altered",
    description: "STK11 loss without a canonical driver mutation.",
  },
  tp53_dominant: {
    label: "TP53-dominant",
    description: "TP53 mutation with no actionable driver in this panel.",
  },
  complex_multidriver: {
    label: "Complex multi-driver",
    description: "More than one driver gene mutated — an unusual profile.",
  },
  pan_negative: {
    label: "Pan-negative",
    description: "No alteration detected across the panel genes.",
  },
};

export function classLabel(classId: string): string {
  return CLASS_INFO[classId as ClassId]?.label ?? classId;
}

export const FLAGS = {
  tki_candidate: "Targeted-therapy candidate",
  tp53_comutation: "TP53 co-mutation",
  multiple_drivers: "Multiple driver genes",
  incomplete_profile: "Incomplete profile",
  confirm_variant: "Variant-level confirmation needed",
  ici_co_mutated: "Immunotherapy-relevant co-mutation",
} as const;

export type FlagId = keyof typeof FLAGS;

const DRIVER: GeneKey[] = ["egfr", "kras", "alk", "met"];

export interface RuleResult {
  classId: ClassId;
  flags: FlagId[];
}

export function classifyRule(profile: GeneProfile): RuleResult {
  const mutated = (g: GeneKey) => profile[g] === "mutated";
  const drivers = DRIVER.filter(mutated);
  const flags = new Set<FlagId>();

  if (GENES.some((g) => profile[g] === "unknown")) flags.add("incomplete_profile");
  if (mutated("tp53") && drivers.length > 0) flags.add("tp53_comutation");
  if (mutated("stk11") && drivers.length > 0) flags.add("ici_co_mutated");

  let classId: ClassId;
  if (drivers.length > 1) {
    classId = "complex_multidriver";
    flags.add("multiple_drivers");
  } else if (mutated("egfr")) {
    classId = "egfr_driven";
    flags.add("tki_candidate");
    flags.add("confirm_variant");
  } else if (mutated("alk")) {
    classId = "alk_driven";
    flags.add("tki_candidate");
  } else if (mutated("met")) {
    classId = "met_altered";
    flags.add("tki_candidate");
    flags.add("confirm_variant");
  } else if (mutated("kras") && mutated("stk11")) {
    classId = "kras_stk11";
    flags.add("confirm_variant");
  } else if (mutated("kras")) {
    classId = "kras_driven";
    flags.add("confirm_variant");
  } else if (mutated("stk11")) {
    classId = "stk11_altered";
  } else if (mutated("tp53")) {
    classId = "tp53_dominant";
  } else {
    classId = "pan_negative";
  }

  return { classId, flags: [...flags] };
}

export const HINTS: Record<ClassId, string[]> = {
  egfr_driven: [
    "EGFR-mutant NSCLC: an EGFR tyrosine-kinase inhibitor (osimertinib class) is the standard first-line consideration.",
    "EGFR TKI eligibility is generally independent of smoking history.",
  ],
  kras_driven: [
    "KRAS-mutant NSCLC without STK11 loss: checkpoint-inhibitor benefit is generally preserved in this subgroup.",
    "KRAS G12C inhibitors (sotorasib / adagrasib class) require variant-level confirmation of G12C.",
  ],
  kras_stk11: [
    "KRAS/STK11 co-mutation has been associated with reduced checkpoint-inhibitor benefit in several NSCLC cohorts.",
    "KRAS G12C inhibitors (sotorasib / adagrasib class) require variant-level confirmation of G12C.",
  ],
  alk_driven: [
    "ALK-rearranged NSCLC: an ALK inhibitor (alectinib / lorlatinib class) is the standard first-line consideration.",
    "ALK fusions are common in never/light smokers; baseline CNS imaging is typical.",
  ],
  met_altered: [
    "MET alteration: MET inhibitors (capmatinib / tepotinib class) are considered for MET exon 14 skipping; confirm the exact variant type.",
    "MET amplification level matters — high-level amplification may qualify for trial enrollment.",
  ],
  stk11_altered: [
    "STK11 loss without a driver mutation: limited targeted options; some cohorts report lower immunotherapy benefit.",
    "Consider a broader NGS panel to exclude co-occurring rare drivers.",
  ],
  tp53_dominant: [
    "TP53 mutation alone carries no targeted-therapy indication from this panel.",
    "Correlate with histology, IHC and a broader panel before excluding actionable drivers.",
  ],
  complex_multidriver: [
    "Multiple simultaneous driver mutations are uncommon — review for sequencing artifact, sample mix-up, or germline findings.",
    "If confirmed, prioritize therapy through molecular tumor-board review.",
  ],
  pan_negative: [
    "No alteration in this six-gene panel — an 'oncogene-negative' profile for these genes.",
    "Consider a broader NGS panel to detect rarer drivers (BRAF, RET, ROS1, NTRK, HER2, etc.).",
  ],
};

const FLAG_HINTS: Partial<Record<FlagId, string>> = {
  tki_candidate: "Profile matches the eligibility pattern for a targeted TKI — confirm the exact variant before therapy.",
  tp53_comutation: "TP53 co-mutation may influence prognosis and is frequent in high-TMB tumors.",
  multiple_drivers: "Driver priority is ambiguous; molecular tumor-board review is advised.",
  incomplete_profile: "One or more gene statuses are unknown — interpretation is provisional until testing is complete.",
  confirm_variant: "Variant-level details (specific hotspot) are needed before therapy selection.",
  ici_co_mutated: "STK11 co-mutation is reported to modulate immunotherapy response in some cohorts.",
};

export type Agreement = "match" | "divergent";

export interface Classification {
  rule: RuleResult;
  ml: MlPrediction;
  agreement: Agreement;
  hints: string[];
}

export function classify(profile: GeneProfile): Classification {
  const rule = classifyRule(profile);
  const ml = predictProfile(profile);
  const flagHints = rule.flags.map((f) => FLAG_HINTS[f]).filter((h): h is string => Boolean(h));
  return {
    rule,
    ml,
    agreement: ml.topClass === rule.classId ? "match" : "divergent",
    hints: [...HINTS[rule.classId], ...flagHints],
  };
}
