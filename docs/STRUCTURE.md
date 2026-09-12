# Krishi Pramaan — Repository Structure (FINAL)

```
Krishi-Pramaan/
├── docs/
│   ├── PRD.md
│   ├── TECH.md
│   ├── STRUCTURE.md
│   ├── CONVENTIONS.md
│   ├── AGENTS.md
│   └── TESTING.md
│
├── backend/                              # Aryaa — FastAPI, already scaffolded, extend it
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py                         # ADD: Evidence, Attestation, Consent, AuditLog
│   ├── schemas.py                        # ADD: Pydantic schemas for the above
│   ├── routers/
│   │   ├── farmers.py                    # exists
│   │   ├── credit_profiles.py            # exists — REPLACE manual credit_score with scoring_service call
│   │   ├── evidence.py                   # NEW
│   │   ├── conflicts.py                  # NEW
│   │   ├── score.py                      # NEW
│   │   ├── consent.py                    # NEW
│   │   └── lender.py                     # NEW
│   ├── services/
│   │   ├── evidence_service.py           # NEW — confidence lookup (TECH.md §4)
│   │   ├── conflict_service.py           # NEW — variance check (TECH.md §5)
│   │   ├── scoring_service.py            # NEW — the combined 1-function/4-output engine (TECH.md §6)
│   │   ├── consent_service.py            # NEW
│   │   └── audit_log_service.py          # NEW — hash-chain append + verify
│   ├── data/                             # sample CSVs — at least one farmer rigged to conflict
│   └── requirements.txt
│
├── frontend/                             # Anisha + Samridhi — does not exist yet
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FarmerDashboard.jsx
│   │   │   ├── FPODashboard.jsx
│   │   │   └── LenderDashboard.jsx
│   │   ├── components/
│   │   │   ├── ScoreExplainer.jsx
│   │   │   ├── EvidenceCard.jsx
│   │   │   ├── ConflictBanner.jsx
│   │   │   ├── PurposeSplitChart.jsx
│   │   │   ├── FPOAggregateBadge.jsx
│   │   │   ├── ConsentToggle.jsx
│   │   │   └── AttestationForm.jsx
│   │   └── api/
│   └── package.json
│
├── ai/                                    # Riya
│   ├── scoring_config/
│   │   └── weights.py                    # w1..w9, separate from logic
│   └── sample_data/                      # kept in sync with backend/data
│
└── README.md
```

## Ownership
| Folder | Owner | Notes |
|---|---|---|
| `backend/` | Aryaa | Owns API contracts + conflict/scoring logic together — tightly coupled, don't split across people |
| `frontend/` | Anisha + Samridhi | Anisha: dashboards/UX; Samridhi: API wiring/loading-error states |
| `ai/` | Riya | Weights config, consumed by `backend/services/scoring_service.py` |
| `docs/` | Shared | Keep in sync with what's actually built |
