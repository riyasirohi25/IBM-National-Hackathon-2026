# Krishi Pramaan — Technical Architecture (FINAL)

## 1. Stack — DECIDED, do not change mid-build
- **Backend:** FastAPI (Python) + SQLAlchemy + SQLite — already scaffolded (Farmer/CreditProfile/Transaction CRUD exists). Extend it, do not restart in Node or any other language.
- **Frontend:** React + Tailwind (does not exist yet — build from scratch)
- **AI/scoring:** implemented directly inside the FastAPI backend as a standalone module/service. No separate Python ML microservice, no ML dependency for the core build.
- **Deployment:** Render (backend) + Vercel (frontend)

## 2. Architecture (data flow)
```
Sample datasets (AGMARKNET / PM-KISAN / PMFBY / NHB slices)
        ↓
Evidence Vault  — {claim, source, value, confidence}
        ↓
FPO Attestation — adds FPO-reported values for select claims
        ↓
Conflict Detector — compares farmer-declared vs FPO vs market values per claim
        ↓
Credit Intelligence Engine — ONE function, FOUR outputs
        ↓
Explainability layer — per-factor contribution + evidence confidence, plain language
        ↓
Consent & Access Layer — grant/revoke + hash-chained audit log
        ↓
REST API (JSON, {success,data,error} envelope)
        ↓
Frontend — Farmer / FPO / Lender dashboards
```

## 3. Data sources
No live API calls. Static sample CSVs, schema-matched to AGMARKNET/PM-KISAN/PMFBY/NHB. Deliberately rig at least one demo farmer's data so the conflict detector fires live.

## 4. Evidence confidence — lookup table, not a model
```python
CONFIDENCE_BY_SOURCE = {
    "government_record": 0.98,
    "market_transaction": 0.95,
    "fpo_verification":   0.92,
    "self_declared":      0.55,
}
```
Each evidence item carries its source; confidence is a dictionary lookup at read/write time. No ML.

## 5. Conflict detection — one variance check
```python
def check_conflict(farmer_value, other_value):
    conflict = abs(farmer_value - other_value) / other_value > 0.20
    if conflict:
        confidence_for_claim *= 0.6
        flag = f"Evidence conflict: farmer claimed {farmer_value}, sources suggest {other_value}"
    return conflict, flag
```
Two conflicting attestations for the same claim: average the penalty, don't stack it. Do not generalize into an anomaly-detection model.

## 6. Credit Intelligence Engine — one function, four outputs
```python
# inputs: crop_diversity, market_price_stability, insurance_claim_ratio,
#         pmkisan_enrollment, community_trust_score, seasonal_income,
#         seasonal_expenses, existing_debt_amount, evidence_confidence_avg

creditworthiness_score = weighted_sum(inputs)              # 0-100, weights in separate config
repayment_capacity      = seasonal_income - seasonal_expenses - existing_debt_amount
recommended_limit       = repayment_capacity * risk_adjustment_factor(creditworthiness_score)
purpose_split           = {"inputs": recommended_limit*0.6, "labour": recommended_limit*0.2, "irrigation": recommended_limit*0.2}
explanation             = {factor: contribution, ...}       # same weighted terms, shown as-is
```
This must NOT be a manually-settable field (the current repo's `credit_score` field via PUT is wrong — replace it). Weights live in one config dict, tunable without touching logic. Zero training step, no ML dependency for the core demo.

## 7. Consent & audit layer — hash-chain, not blockchain
```python
hash_n = sha256(str(event_n) + hash_n_minus_1)
```
Say exactly this in the pitch: "tamper-evident audit log," never "blockchain." Remove "blockchain" from README/roadmap language entirely.

## 8. API contract
```json
{ "success": true, "data": { ... }, "error": null }
{ "success": false, "data": null, "error": "human-readable message" }
```

## 9. API endpoints (target state)
```
POST   /api/v1/farmers                          create farmer profile
GET    /api/v1/farmers/{id}                      fetch profile + evidence vault
POST   /api/v1/farmers/{id}/evidence             add a claim
GET    /api/v1/farmers/{id}/evidence             list claims
POST   /api/v1/farmers/{id}/attestations         FPO adds a vouch + optional claim value
GET    /api/v1/farmers/{id}/conflicts            list detected conflicts
POST   /api/v1/farmers/{id}/score                trigger the credit intelligence engine
GET    /api/v1/farmers/{id}/score                fetch score + repayment capacity + limit + explanation
POST   /api/v1/farmers/{id}/consent              grant/revoke a lender's access
GET    /api/v1/lender/{lenderId}/farmers         list only consented farmer profiles
GET    /api/v1/fpo/{fpoId}/aggregate-risk        % of FPO's farmers verified / no conflicts
GET    /api/v1/farmers/{id}/audit-log            hash-chained event log
GET    /api/v1/farmers/{id}/export               (stretch) export profile as JSON
```
