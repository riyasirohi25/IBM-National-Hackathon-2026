# Krishi Pramaan — Product Requirements Document (FINAL)
**Tagline:** "Saboot Se Score, Kisan Ka Control." (Verified Proof. Farmer-Owned Trust.)
**IBM National Hackathon 2026 · Problem Statement 2 — Community-Owned Credit Network for Agriculture & Horticulture**
**Build tool:** Google Antigravity · **Team:** Anisha (frontend/UX), Samridhi (frontend/integration), Aryaa (backend/architecture), Riya (AI/explainability)

## 1. One-line value proposition
Krishi Pramaan turns a farmer's real agricultural activity — verified from multiple sources, not just self-reported — into a portable, explainable credit profile that the farmer owns and chooses who can see.

## 2. Differentiator
> Everyone else will build another farmer credit score. We're building a trust engine: every claim is checked against multiple sources, every score is explained, and the farmer controls who sees it.

## 3. Current build status (read before prompting the agent)
A first backend pass already exists (FastAPI, Farmer + CreditProfile + Transaction CRUD). It is **incomplete, not wrong to build on** — it has none of the evidence/confidence/conflict/scoring/consent/audit logic below. Extend it. Do not restart in a different language.

## 4. Personas
- **Farmer:** wants an explainable score and control over who sees it.
- **FPO member:** vouches for the farmer's activity — one Community Trust Score, not a separate "FPO score."
- **Lender/NBFC officer:** views only consented farmers, sees score + evidence + explanation, never raw data, never an auto-approval.

## 5. Must-build modules (in this order)

### 5.1 Farmer Identity — mostly done
Registration, profile (land, crops, location, fpo_id). One farmer = one profile = one ID. No real KYC/document verification.

### 5.2 Evidence Vault with Confidence Tagging — not built yet
Every data point stored as claim → source → confidence, static lookup by source type:

| Source | Confidence |
|---|---|
| Government record (PM-KISAN/PMFBY) | 0.98 |
| Market transaction (AGMARKNET) | 0.95 |
| FPO verification | 0.92 |
| Farmer self-declared | 0.55 |

### 5.3 FPO Attestation → single Community Trust Score — not built yet
FPO member vouches for a farmer, optionally submitting a value for a claim (which routes through conflict detection). One Community Trust Score from: verified evidence ratio + attestation count + claim-vs-evidence consistency.

### 5.4 Evidence Conflict Detection — not built yet
Simple variance check, not a model: flag if `abs(farmer_value - other_value) / other_value > 0.20`, then multiply that claim's confidence by 0.6.

### 5.5 Explainable Credit Intelligence — not built yet, this is the core gap
ONE function, FOUR outputs. Not a mutable field set via PUT — an actual computed function:
- Creditworthiness score (0–100)
- Repayment capacity (seasonal income − expenses − existing debt)
- Recommended credit limit (repayment capacity × risk factor)
- Per-factor plain-language explanation

### 5.6 Existing Obligations — one field
`existing_debt_amount`. Subtracts from repayment capacity. No NOC workflow.

### 5.6a Purpose-of-Credit Split — not built yet
Static rule on `recommended_limit`: 60% crop inputs / 20% labour / 20% irrigation. Answers the hackathon's official "what should credit be used for?" question.

### 5.6b FPO Aggregate Risk View — not built yet
One read-only stat: "% of this FPO's attested farmers with verified evidence / no conflict flags." No divide-by-zero on 0 farmers.

### 5.7 Consent & Access Control — not built yet
Grant/revoke access per lender + hash-chained audit log of every attestation and access event. Tamper-evident, **explicitly not blockchain** — remove any "blockchain" language from docs/README.

### 5.8 Lender Dashboard — not built yet
View only consented farmers: score, evidence summary with confidence %, explanation, conflict flags. No raw data beyond what's exposed.

## 6. Stretch (only after 5.1–5.8 + 5.6a/5.6b are demo-tested)
1. Export profile as JSON ("Export My Agricultural Economic Identity")
2. "What would improve my score" — one if-else on lowest-weighted factor
3. Score history graph (2–3 hardcoded mock points)
4. Economic timeline (hardcoded 3–4 events)

## 7. Explicitly NOT building
Real blockchain/smart contracts/crypto; real KYC/identity verification; real bank/lender API integrations or loan disbursement; ML anomaly/fraud detection beyond the 20% variance check; post-loan monitoring; notifications; multi-lender marketplace; native mobile app; multi-language UI; live ingestion from AGMARKNET/PM-KISAN/PMFBY/NHB (static sample CSVs only); satellite imagery; IoT sensors; unverified "impact numbers" (no invented pilot stats, uptime SLAs, or concurrent-user targets — this is a hackathon MVP, not a production launch).

## 8. Demo journey (must run live, end to end)
1. Farmer registers, enters land/crop/activity details (some self-declared).
2. FPO member attests, optionally submitting a value for a claim.
3. System compares farmer vs FPO vs market sample data → flags conflict, reduces confidence if mismatched.
4. Credit Intelligence runs → score, repayment capacity, recommended limit, plain-language "why," including evidence confidence.
5. Farmer grants a specific lender access.
6. Lender dashboard shows score, evidence with confidence %, conflict flag if any. System never approves anything.
7. Farmer revokes access → audit log records it, lender's list updates.

## 9. Success criteria
- Full journey runs live, no rehearsed workaround.
- At least one demo farmer deliberately shows a conflict flag (rigged sample data).
- Score/repayment capacity/limit always explained in plain language, never bare numbers.
- A judge can restate the differentiator within 30 seconds.

## 10. Mapping to official hackathon evaluation questions
| Official question | Answered by |
|---|---|
| Who is a trustworthy borrower? | §5.5 score + §5.2 evidence confidence + §5.3 community trust score |
| How much credit can safely be extended? | §5.5 recommended_limit |
| What should the credit be used for? | §5.6a purpose-of-credit split |
| Can the farmer repay from crop/market income? | §5.5 repayment_capacity |
| How can the community reduce lending risk? | §5.6b FPO aggregate risk + §5.3 attestation |
| Better credit without surrendering data ownership? | §5.7 consent/revoke + audit log |

## 11. Mandatory disclaimer (every score screen)
> "AI-generated assessment for decision support. Final lending decisions remain with the authorized financial institution."
