# Krishi Pramaan — Antigravity Usage Playbook (AGENTS.md) — FINAL

## Ground rules
- One prompt = one module from PRD.md §5. Never say "build the rest of the project."
- Paste the relevant PRD.md/TECH.md section into context before asking for implementation.
- Tell the agent explicitly what NOT to touch (PRD.md §7, CONVENTIONS.md).
- After every prompt, ask the agent to paste back the actual model/function/route code it wrote — do not accept a prose description of what it did as proof it did it. This has silently failed twice already on a different tool.
- Model selection per prompt is noted below — this matters for not running out of weekly quota.

## Current state (don't rebuild this)
Backend already has: Farmer CRUD, CreditProfile CRUD (needs correction), Transaction log, FastAPI + SQLAlchemy + SQLite. No frontend exists yet.

## Sequenced prompts

### Module 1 — Evidence Vault [Model: Gemini 3.1 Pro]
> "Here is TECH.md §4 and CONVENTIONS.md's evidence object shape [paste]. Add an Evidence SQLAlchemy model and Pydantic schema matching this exact shape, with confidence auto-set from the CONFIDENCE_BY_SOURCE lookup table, not user-supplied. Add POST and GET /api/v1/farmers/{id}/evidence. Paste the model, schema, and route code."

### Module 2 — Conflict Detection [Model: Claude Sonnet 4.6]
> "Here is TECH.md §5 [paste]. Implement check_conflict as a standalone, testable function in services/conflict_service.py: given two evidence values for the same claim, flag conflict if they differ by more than 20%, and reduce that claim's confidence by multiplying by 0.6. If two FPO attestations conflict on the same claim, average the penalty, don't stack it. Expose GET /api/v1/farmers/{id}/conflicts. Paste the function code."

### Module 3 — Credit Intelligence Engine [Model: Claude Sonnet 4.6]
> "Here is TECH.md §6 [paste]. Replace the existing manually-settable credit_score field entirely. Implement scoring_service.py as ONE function taking the inputs listed and returning creditworthiness_score, repayment_capacity, recommended_limit, purpose_split, and a per-factor explanation dict. Weights must live in a separate config dict in ai/scoring_config/weights.py, not hardcoded inline. Zero ML, zero training step. Paste the function and the weights config."

### Module 4 — FPO Attestation [Model: Gemini 3.1 Pro]
> "Here is PRD.md §5.3 [paste]. Implement the attestation endpoint: an FPO member can vouch for a farmer and optionally submit a value for one of the farmer's claims, which must route through conflict_service.check_conflict. Add POST /api/v1/farmers/{id}/attestations. Paste the route and any new model."

### Module 5 — Consent, Audit Log, FPO Aggregate Risk [Model: Claude Sonnet 4.6]
> "Here is TECH.md §7 and PRD.md §5.6b, §5.7 [paste]. Implement: (1) consent grant/revoke endpoint, (2) a hash-chained audit log where hash_n = sha256(event_n + hash_n-1), logged on every attestation and every access grant/revoke, (3) GET /api/v1/fpo/{fpoId}/aggregate-risk returning % of that FPO's farmers with verification_status=verified and no conflict flags, with no divide-by-zero on 0 farmers. Call this a tamper-evident audit log, never blockchain — check the README doesn't say blockchain anywhere. Paste all three implementations."

### Module 6 — Lender Dashboard endpoint [Model: Gemini 3.1 Pro]
> "Add GET /api/v1/lender/{lenderId}/farmers returning only farmers who have granted that lender consent, with score, evidence summary (with confidence %), and any conflict flags. Paste the route."

### Module 7 — Frontend scaffold [Model: Gemini 3.1 Pro]
> "Here is STRUCTURE.md's frontend/ layout [paste]. Scaffold React + Tailwind: FarmerDashboard, FPODashboard, LenderDashboard pages, and EvidenceCard, ConflictBanner, PurposeSplitChart, FPOAggregateBadge, ConsentToggle, AttestationForm components. Scaffolding and routing only, no business logic yet."

### Module 8 — Wire frontend to real backend [Model: Gemini 3.1 Pro, fall back to Flash if quota is tight]
> "Wire FarmerDashboard to GET /api/v1/farmers/{id}/score and /evidence, showing score, repayment capacity, limit, purpose split, and explanation. Wire LenderDashboard to /api/v1/lender/{lenderId}/farmers. Add loading and error states. No mock data."

### Integration + rigged demo data [Model: Gemini 3.1 Pro]
> "Walk through the demo journey in PRD.md §8 end-to-end using sample data in backend/data/. Confirm at least one farmer's data triggers a conflict flag — if none do, adjust the sample data so one does. List every place the journey currently breaks."

### Debugging [Model: whichever model wrote the broken module]
> "Fix only the integration errors that would break a live demo of the journey in PRD.md §8. Ignore cosmetic issues. List anything deliberately left unfixed and why."

### Testing & deployment [Model: Gemini 3.1 Pro]
> "Create and run the smoke tests in TESTING.md. Then deploy backend to Render and frontend to Vercel."

### Final feature freeze
No new prompts except bug fixes surfaced in rehearsal. Nothing outside PRD.md §5 gets added.

## Quota discipline
- Default to Gemini 3.1 Pro for anything CRUD/scaffolding-shaped.
- Use Claude Sonnet 4.6 only for the three logic-precision modules (conflict detection, scoring engine, consent/audit).
- Do not touch Claude Opus unless Sonnet fails the same module twice.
- If Gemini 3.1 Pro's weekly quota runs low, drop to Gemini 3 Flash (5-hour refresh) for scaffolding-only prompts rather than burning remaining Claude quota.
