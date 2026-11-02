CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_label TEXT NOT NULL,
  age INTEGER,
  sex TEXT CHECK (sex IN ('male','female','other','unknown')) DEFAULT 'unknown',
  smoking_status TEXT CHECK (smoking_status IN ('never','former','current','unknown')) DEFAULT 'unknown',
  specimen_date DATE,
  egfr TEXT NOT NULL DEFAULT 'unknown' CHECK (egfr IN ('mutated','wildtype','unknown')),
  kras TEXT NOT NULL DEFAULT 'unknown' CHECK (kras IN ('mutated','wildtype','unknown')),
  tp53 TEXT NOT NULL DEFAULT 'unknown' CHECK (tp53 IN ('mutated','wildtype','unknown')),
  alk TEXT NOT NULL DEFAULT 'unknown' CHECK (alk IN ('mutated','wildtype','unknown')),
  stk11 TEXT NOT NULL DEFAULT 'unknown' CHECK (stk11 IN ('mutated','wildtype','unknown')),
  met TEXT NOT NULL DEFAULT 'unknown' CHECK (met IN ('mutated','wildtype','unknown')),
  rule_class TEXT NOT NULL,
  rule_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  ml_class TEXT NOT NULL,
  ml_probabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  clinical_hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_profiles TO authenticated;
GRANT ALL ON public.patient_profiles TO service_role;

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patient profiles"
  ON public.patient_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own patient profiles"
  ON public.patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patient profiles"
  ON public.patient_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own patient profiles"
  ON public.patient_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_patient_profiles_user_id ON public.patient_profiles (user_id, created_at DESC);