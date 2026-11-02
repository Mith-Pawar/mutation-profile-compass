export const GENES = ["egfr", "kras", "tp53", "alk", "stk11", "met"] as const;

export type GeneKey = (typeof GENES)[number];
export type GeneStatus = "mutated" | "wildtype" | "unknown";
export type GeneProfile = Record<GeneKey, GeneStatus>;

export const GENE_INFO: Record<GeneKey, { name: string; role: string }> = {
  egfr: {
    name: "EGFR",
    role: "Growth-factor receptor — classic driver; TKI-sensitive hotspots (ex19 del, L858R)",
  },
  kras: {
    name: "KRAS",
    role: "RAS-pathway driver; G12C is druggable",
  },
  tp53: {
    name: "TP53",
    role: "Tumor suppressor — common co-mutation, prognostic relevance",
  },
  alk: {
    name: "ALK",
    role: "Fusion driver — potent inhibitor options",
  },
  stk11: {
    name: "STK11 (LKB1)",
    role: "Tumor suppressor — modulates immunotherapy response",
  },
  met: {
    name: "MET",
    role: "Receptor driver — exon 14 skipping is druggable",
  },
};

export const emptyProfile: GeneProfile = {
  egfr: "unknown",
  kras: "unknown",
  tp53: "unknown",
  alk: "unknown",
  stk11: "unknown",
  met: "unknown",
};
