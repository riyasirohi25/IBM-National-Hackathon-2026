# Krishi Pramaan — Conventions (FINAL)

## Branching
- `main` stays deployable after hour 2
- `feature/<owner>-<short-desc>`
- Merge every 60–90 minutes

## Commits
`feat:`, `fix:`, `docs:`, `chore:` prefixes

## API contract — every response uses this envelope
```json
{ "success": true, "data": { ... }, "error": null }
```
```json
{ "success": false, "data": null, "error": "human-readable message" }
```

## Evidence object shape — every module touching evidence uses this exact shape
```json
{
  "claim": "production_quantity",
  "value": 12,
  "unit": "tonnes",
  "source": "self_declared",
  "confidence": 0.55,
  "conflict": false
}
```
Never invent a parallel shape for a new evidence type (production, income, insurance, PM-KISAN status, etc.) — reuse this envelope so the frontend renders all of them with one `EvidenceCard` component.

## Naming
Python: snake_case. JS/TS: camelCase. DB fields snake_case, mapped explicitly at the API layer.

## Sample data
Lives in `backend/data/` and `ai/sample_data/`, kept identical. At least one farmer's data must be deliberately rigged so self-declared vs FPO/market values disagree by >20% — this is what proves the conflict detector during the demo. Don't discover at hour 6 that none of your sample data triggers it.

## Error handling
Backend validates and returns the envelope above on failure. Frontend always has a loading and error state.

## What NOT to bikeshed
- CSS framework, DB choice, stretch-model naming
- "Trust score" vs "creditworthiness" vs "repayment capacity" naming — locked in PRD.md §5. Do not relitigate under time pressure.
- Backend language/framework — FastAPI is decided (see TECH.md §1), do not propose switching to Node mid-build.

## Language for the audit log
Always say "tamper-evident audit log." Never say "blockchain," "on-chain," or "distributed ledger" anywhere in code comments, README, or pitch material.
