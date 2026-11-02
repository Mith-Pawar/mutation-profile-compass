import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { GeneStatus } from "@/lib/mutations";

const statusSchema = z.enum(["mutated", "wildtype", "unknown"]);

export const patientInputSchema = z.object({
  patient_label: z.string().trim().min(1).max(80),
  age: z.number().int().min(0).max(120).nullable(),
  sex: z.enum(["male", "female", "other", "unknown"]),
  smoking_status: z.enum(["never", "former", "current", "unknown"]),
  specimen_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  profile: z.object({
    egfr: statusSchema,
    kras: statusSchema,
    tp53: statusSchema,
    alk: statusSchema,
    stk11: statusSchema,
    met: statusSchema,
  }),
  rule_class: z.string().max(40),
  rule_flags: z.array(z.string().max(40)).max(10),
  ml_class: z.string().max(40),
  ml_probabilities: z.record(z.string(), z.number().min(0).max(1)),
  clinical_hints: z.array(z.string().max(400)).max(12),
  notes: z.string().max(2000).nullable(),
});

export type PatientInput = z.infer<typeof patientInputSchema>;

export interface PatientRecord {
  id: string;
  patient_label: string;
  age: number | null;
  sex: string;
  smoking_status: string;
  specimen_date: string | null;
  egfr: GeneStatus;
  kras: GeneStatus;
  tp53: GeneStatus;
  alk: GeneStatus;
  stk11: GeneStatus;
  met: GeneStatus;
  rule_class: string;
  rule_flags: string[];
  ml_class: string;
  ml_probabilities: Record<string, number>;
  clinical_hints: string[];
  notes: string | null;
  created_at: string;
}

export const savePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => patientInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("patient_profiles")
      .insert({
        user_id: context.userId,
        patient_label: data.patient_label,
        age: data.age,
        sex: data.sex,
        smoking_status: data.smoking_status,
        specimen_date: data.specimen_date,
        egfr: data.profile.egfr,
        kras: data.profile.kras,
        tp53: data.profile.tp53,
        alk: data.profile.alk,
        stk11: data.profile.stk11,
        met: data.profile.met,
        rule_class: data.rule_class,
        rule_flags: data.rule_flags,
        ml_class: data.ml_class,
        ml_probabilities: data.ml_probabilities,
        clinical_hints: data.clinical_hints,
        notes: data.notes,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const listPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PatientRecord[]> => {
    const { data, error } = await context.supabase
      .from("patient_profiles")
      .select(
        "id, patient_label, age, sex, smoking_status, specimen_date, egfr, kras, tp53, alk, stk11, met, rule_class, rule_flags, ml_class, ml_probabilities, clinical_hints, notes, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as PatientRecord[];
  });

export const deletePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("patient_profiles")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
