# Roadmap

1. [x] Clarify scope with user (purpose, input, output, storage)
2. [x] Enable Lovable Cloud + email/password auth
3. [ ] Database migration: `patient_profiles` table (6 gene statuses, classification results, RLS per user)
4. [ ] Classification engine: rule-based classes + clinical hints (src/lib/classification.ts)
5. [ ] ML model: train multinomial logistic regression offline, export weights, inference in app (src/lib/ml/)
6. [ ] Auth pages: /auth (sign in + sign up), reset-password page
7. [ ] App pages: / landing, /dashboard, /classify (form + results), /patients (records list)
8. [ ] Server functions: save / list / get / delete patient classifications
9. [ ] Design system in src/styles.css (clinical scientific theme)
10. [ ] Tests for classification rules + run checks
11. [ ] End-to-end verify in browser (sign up, classify, save, view records)
