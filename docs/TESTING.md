# Krishi Pramaan — Testing Plan (FINAL)

Testing exists to protect the live demo, not to reach coverage targets.

## 1. Priority order
1. The exact demo journey in PRD.md §8
2. Conflict detection actually firing on the rigged demo farmer — your best feature; if it silently doesn't trigger, you lose your strongest moment
3. Consent toggle actually changing lender-visible data
4. Score/repayment-capacity/limit rendering correctly and consistently for 2–3 different demo farmers
5. Everything else

## 2. Smoke test checklist (before every merge to `main` after hour 3)
- [ ] Can create a farmer profile and add evidence claims
- [ ] Confidence values match the lookup table (government=98%, market=95%, FPO=92%, self-declared=55%)
- [ ] Conflict detector flags a >20% variance and does NOT flag a <20% variance (test both sides of the threshold)
- [ ] Scoring engine returns all four outputs (score, repayment capacity, limit, explanation) for a farmer with zero attestations, without crashing
- [ ] Scoring engine returns visibly different outputs for a farmer with strong evidence vs weak evidence
- [ ] credit_score is never settable via a raw PUT — it only comes from the scoring engine
- [ ] Granting consent makes the farmer appear in that lender's list; revoking removes them
- [ ] Audit log shows attestation + consent events in order with a valid hash chain
- [ ] Purpose-of-credit split percentages sum to 100% and scale correctly when recommended_limit changes
- [ ] FPO aggregate-risk endpoint returns a sane % even when the FPO has only 1 attested farmer (no divide-by-zero on 0 farmers)
- [ ] Frontend shows loading and error states for at least one intentionally-failed API call
- [ ] README and any docstrings contain no mention of "blockchain"

## 3. Known edge cases to check deliberately
- Farmer with no attestations — trust score and conflict detector shouldn't crash on empty data
- Two conflicting attestations from different FPO members for the same claim — average the penalty, don't stack it; be able to explain the choice
- Repayment capacity going negative (heavy existing debt) — decide what the UI shows (e.g. "not currently recommended for additional credit"), don't display a negative number unexplained
- Lender viewing a farmer who then revokes access mid-session — decide live-update vs next-load behavior

## 4. Demo rehearsal
Run the full journey three times, timed:
1. Slow, narrating every click
2. At demo pace — score → explanation → consent → lender view should take under 90 seconds, and the conflict flag must be visibly triggered
3. With a teammate trying to break it (wrong inputs, double-clicking consent, refreshing mid-flow)

## 5. What we are NOT testing
Load/performance testing, security penetration testing, cross-browser testing — out of scope. If asked, say "not implemented, out of scope for MVP" rather than overclaiming.
