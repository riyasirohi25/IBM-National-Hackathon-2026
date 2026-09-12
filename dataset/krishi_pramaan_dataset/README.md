# Krishi Pramaan — Synthetic Demo Dataset

## Files
- `farmers.csv`: farmer profiles and scoring inputs
- `evidence.csv`: claim → source → confidence records
- `fpo_attestations.csv`: FPO verification values
- `market_transactions.csv`: sample market transactions
- `government_records.csv`: sample PM-KISAN/PMFBY-style records
- `scoring_weights.json`: transparent scoring weights
- `metadata.json`: dataset notes and deliberate demo conflict

## Deliberate conflict for the live demo
Farmer `F001` self-declares production of **12 tonnes**, while the FPO attestation reports **7.5 tonnes**.
The variance is greater than 20%, so the conflict detector should flag it and reduce confidence.

## Important
This dataset is synthetic and designed for a hackathon prototype. It is not suitable for real lending, real credit underwriting, or claims about actual farmer behavior.
