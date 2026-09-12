# Krishi Pramaan

> **"Saboot Se Score, Kisan Ka Control."**  
> *Verified Proof. Farmer-Owned Trust.*

**IBM National Hackathon 2026 — Problem Statement 2**  
**Community-Owned Credit Network for Agriculture & Horticulture**

---

## Overview

Krishi Pramaan is a community-owned agricultural credit intelligence platform that transforms a farmer's real agricultural activity into a **portable, explainable, and farmer-controlled credit profile**.

Instead of relying only on self-reported information, Krishi Pramaan verifies farmer claims using multiple independent sources such as:

- Government records
- Market transactions
- FPO attestations
- Farmer-declared information

The platform evaluates the reliability of evidence, detects conflicts between sources, generates an explainable credit assessment, and allows farmers to control which lenders can access their profile.

> **AI-generated assessment is provided for decision support only. Final lending decisions remain with the authorized financial institution.**

---

## Problem Statement

Agricultural lending can be difficult when farmers have limited formal credit histories and agricultural information is fragmented across multiple sources.

Common challenges include:

- Dependence on self-declared agricultural information
- Limited verifiable credit history
- Fragmented agricultural records
- Difficulty validating farmer claims
- Lack of transparency in credit assessment
- Limited farmer control over financial information
- Difficulty assessing agricultural risk at the individual and community level

Krishi Pramaan addresses these challenges through a **verifiable, explainable, community-supported, and farmer-controlled credit intelligence system**.

---

## Solution

Krishi Pramaan follows a verification-to-credit workflow:

```text
Farmer Claims
     ↓
Evidence Collection
     ↓
Independent Verification
     ↓
Conflict Detection
     ↓
Confidence Assessment
     ↓
Credit Intelligence Engine
     ↓
Explainable Credit Profile
     ↓
Farmer-Controlled Consent
     ↓
Lender Access
```

The platform combines agricultural evidence from multiple sources and converts verified information into transparent credit intelligence while keeping the farmer in control of data sharing.

---

## Core Features

### Evidence Vault

The Evidence Vault connects farmer claims with supporting evidence.

```text
Claim → Source → Verification → Confidence
```

Supported evidence sources include:

- Government records
- Market transactions
- FPO attestations
- Farmer declarations

Confidence is determined by predefined source reliability rules and is not directly supplied by the user.

---

### FPO Attestation

FPO members can attest to farmer information and agricultural claims.

These attestations contribute to a **Community Trust Score**, allowing verified community knowledge to become part of the farmer's credit profile.

---

### Conflict Detection

The system compares farmer-declared values with information obtained from independent sources.

A conflict is flagged when the variance exceeds **20%**.

```text
Variance > 20%
       ↓
Conflict Flag
       ↓
Claim Confidence × 0.6
```

The confidence penalty is applied to the affected claim and is not repeatedly stacked for the same conflict.

---

### Credit Intelligence Engine

The Credit Intelligence Engine generates four primary outputs:

1. Creditworthiness Score
2. Repayment Capacity
3. Recommended Credit Limit
4. Plain-Language Explanation

The objective is not just to produce a score, but to make the assessment understandable.

---

### Purpose-of-Credit Allocation

The recommended credit amount is structured according to agricultural requirements:

```text
60% → Crop Inputs
20% → Labour
20% → Irrigation
```

This provides a transparent view of the intended allocation of credit.

---

### FPO Aggregate Risk

Krishi Pramaan provides an aggregate-level risk indicator for FPOs.

It considers the percentage of attested farmers with:

- Verified evidence
- No conflict flags

This gives lenders and FPOs a community-level view without unnecessarily exposing individual farmer data.

---

### Farmer-Controlled Consent

Farmers control access to their credit profiles.

They can:

- Grant access to a specific lender
- Revoke lender access
- Review access history
- Control who can view their profile

Lenders only receive access to profiles explicitly shared with them.

---

### Tamper-Evident Audit Log

Consent and access-related actions are recorded through a tamper-evident hash chain.

```text
Event 1
   ↓
Hash 1
   ↓
Event 2 + Hash 1
   ↓
Hash 2
   ↓
Event 3 + Hash 2
   ↓
Hash 3
```

This provides tamper evidence without introducing blockchain infrastructure.

> **Krishi Pramaan does not use blockchain, smart contracts, or cryptocurrency.**

---

### Lender Dashboard

The lender dashboard displays only profiles for which access has been granted.

It provides:

- Credit score
- Evidence summary
- Confidence percentage
- Score explanation
- Conflict indicators
- Repayment capacity
- Recommended credit limit

The platform does **not** automatically approve or reject loans.

---

## System Architecture

```text
                         ┌─────────────────────┐
                         │       FARMER        │
                         │ Claims & Activities │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    EVIDENCE VAULT   │
                         │                     │
                         │ Government Records  │
                         │ Market Transactions │
                         │ FPO Attestations    │
                         │ Farmer Declarations │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ CONFLICT DETECTION  │
                         │                     │
                         │    Variance > 20%   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ CREDIT INTELLIGENCE │
                         │       ENGINE        │
                         │                     │
                         │ Credit Score        │
                         │ Repayment Capacity  │
                         │ Credit Limit        │
                         │ Explanation         │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                ┌─────────────────┐   ┌─────────────────┐
                │     FARMER      │   │       FPO       │
                │    DASHBOARD    │   │    DASHBOARD    │
                └────────┬────────┘   └────────┬────────┘
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ CONSENT MANAGEMENT  │
                         │                     │
                         │ Grant / Revoke      │
                         │ Lender Access       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  LENDER DASHBOARD   │
                         │                     │
                         │ Verified Profile    │
                         │ Score & Explanation │
                         │ Evidence Summary    │
                         └─────────────────────┘
```

---

## Project Structure

```text
KrishiPramaan/
│
├── ai/
│   └── scoring_config/
│       └── weights.py
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth_model.py
│   ├── requirements.txt
│   ├── seed.py
│   ├── seed_auth.py
│   ├── refresh_db.py
│   ├── fix_db.py
│   │
│   ├── routers/
│   │   ├── attestations.py
│   │   ├── auth.py
│   │   ├── conflicts.py
│   │   ├── consent.py
│   │   ├── evidence.py
│   │   ├── farmers.py
│   │   ├── fpo.py
│   │   ├── lender.py
│   │   └── score.py
│   │
│   └── services/
│       ├── audit_log_service.py
│       ├── conflict_service.py
│       ├── evidence_service.py
│       └── scoring_service.py
│
├── dataset/
│   └── krishi_pramaan_dataset/
│       ├── farmers.csv
│       ├── evidence.csv
│       ├── fpo_attestations.csv
│       ├── government_records.csv
│       ├── market_transactions.csv
│       ├── metadata.json
│       └── scoring_weights.json
│
├── docs/
│   ├── PRD.md
│   ├── TECH.md
│   ├── STRUCTURE.md
│   ├── CONVENTIONS.md
│   ├── TESTING.md
│   └── AGENTS.md
│
├── frontend/
│   └── src/
│       └── pages/
│
├── ss/
│   └── screenshots/
│
└── README.md
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Styling | Tailwind CSS |
| Backend | FastAPI |
| Language | Python |
| ORM | SQLAlchemy |
| Database | SQLite |
| Authentication | JWT |
| API Documentation | FastAPI / Swagger |
| Credit Intelligence | Python-based scoring engine |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

### Intelligence Layer

The current hackathon implementation uses a lightweight Python-based **Credit Intelligence Engine**.

The scoring weights are maintained separately from the scoring logic, allowing the scoring configuration to be modified independently.

The MVP does not require a machine-learning training pipeline.

---

## Authentication

The application implements JWT-based authentication and supports three user types:

- Farmer
- FPO
- Lender

Each user type has access to functionality relevant to its workflow.

---

## API Overview

The backend exposes REST APIs through FastAPI.

All API responses follow a consistent JSON envelope.

### Success Response

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": "Human-readable error message"
}
```

### Farmer APIs

```text
POST   /api/v1/farmers
GET    /api/v1/farmers/{id}

POST   /api/v1/farmers/{id}/evidence
GET    /api/v1/farmers/{id}/evidence

GET    /api/v1/farmers/{id}/conflicts

POST   /api/v1/farmers/{id}/attestations

POST   /api/v1/farmers/{id}/score
GET    /api/v1/farmers/{id}/score

POST   /api/v1/farmers/{id}/consent
GET    /api/v1/farmers/{id}/audit-log
```

### Lender APIs

```text
GET    /api/v1/lender/{lenderId}/farmers
```

### FPO APIs

```text
GET    /api/v1/fpo/{fpoId}/aggregate-risk
```

### Authentication APIs

```text
POST   /login
POST   /register/farmer
POST   /register/fpo
POST   /register/lender
```

---

## Running Locally

### Prerequisites

Install the following before running the project:

- Python 3.10+
- Node.js 18+
- npm
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/riyasirohi25/Krishi-Pramaan.git
cd Krishi-Pramaan
```

---

### 2. Start the Backend

Open a terminal and run:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend API:

```text
http://localhost:8000
```

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
```

---

### 3. Start the Frontend

Open a second terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## Database

The project uses SQLite for the hackathon MVP.

Sample agricultural data is provided in:

```text
dataset/krishi_pramaan_dataset/
```

The backend contains scripts for preparing and refreshing sample data:

```text
backend/seed.py
backend/seed_auth.py
backend/refresh_db.py
backend/fix_db.py
```

---

## Demo Workflow

The complete application can be demonstrated through the following journey:

```text
1. Farmer Registration
        ↓
2. Farmer enters land, crop and activity details
        ↓
3. Evidence is associated with farmer claims
        ↓
4. FPO member submits an attestation
        ↓
5. System compares independent sources
        ↓
6. Conflicting information is detected
        ↓
7. Credit Intelligence Engine runs
        ↓
8. Credit Score + Repayment Capacity + Credit Limit
        ↓
9. Plain-language explanation is displayed
        ↓
10. Farmer grants access to a specific lender
        ↓
11. Lender views the consented credit profile
        ↓
12. Farmer revokes lender access
        ↓
13. Audit Log records the consent change
```

---

## Explainability

A key principle of Krishi Pramaan is that credit assessment should not be a black box.

Instead of displaying only:

```text
Credit Score: 78
```

the platform provides factor-level explanations, for example:

```text
Why this score?

✓ Verified agricultural activity
✓ Positive FPO attestation
✓ Consistent market transaction history
✓ High evidence confidence

⚠ One claim contains a source conflict
```

This helps farmers and other stakeholders understand the factors contributing to the assessment.

---

## Privacy & Consent

Krishi Pramaan follows a farmer-first data ownership model.

```text
                    FARMER
                       │
                       │ Owns Profile
                       ▼
              CONSENT MANAGEMENT
                 │           │
                 ▼           ▼
              GRANT        REVOKE
                 │           │
                 └─────┬─────┘
                       ▼
                  AUDIT LOG
                       │
                       ▼
                LENDER ACCESS
```

Lenders cannot automatically access every farmer profile.

Access is explicitly granted by the farmer and can be revoked by the farmer.

---

## Data Sources

The hackathon MVP uses static sample datasets representing multiple agricultural information sources.

```text
dataset/
└── krishi_pramaan_dataset/
    ├── farmers.csv
    ├── evidence.csv
    ├── fpo_attestations.csv
    ├── government_records.csv
    ├── market_transactions.csv
    ├── metadata.json
    └── scoring_weights.json
```

These datasets simulate the independent verification ecosystem required by the platform.

---

## Screenshots

Application screenshots are available in:

```text
ss/
```

They demonstrate the working application and its major interfaces.

---

## Deployment

The application is designed for separate frontend and backend deployment.

```text
                    ┌─────────────────┐
                    │     Vercel      │
                    │ React Frontend  │
                    └────────┬────────┘
                             │
                             │ REST API
                             ▼
                    ┌─────────────────┐
                    │     Render      │
                    │ FastAPI Backend │
                    └────────┬────────┘
                             │
                             ▼
                       SQLite Database
```

---

## Project Limitations

Krishi Pramaan is a **hackathon MVP**, not a production lending infrastructure.

The current implementation does not include:

- Real blockchain or smart contracts
- Cryptocurrency
- Real KYC or identity verification
- Live bank or lender API integration
- Loan disbursement
- ML-based fraud or anomaly detection
- Post-loan monitoring
- Automated loan approval
- Multi-lender marketplace
- Native mobile application
- Multi-language interface
- Live AGMARKNET integration
- Live PM-KISAN integration
- Live PMFBY integration
- Live NHB integration
- Satellite imagery
- IoT sensor integration

The current agricultural datasets are static sample datasets.

No unsupported pilot statistics, production uptime claims, or concurrent-user claims are made.

---

## Future Scope

Potential future enhancements include:

- Live government data integrations
- Real-time agricultural market verification
- Digital KYC integration
- Multilingual farmer interfaces
- Dedicated mobile application
- Satellite-based crop verification
- IoT-based agricultural evidence
- Advanced anomaly and fraud detection
- Post-loan monitoring
- Financial institution integrations
- Loan application and disbursement workflows
- Community-based credit intelligence
- ML-based agricultural credit risk models

---

## Documentation

Detailed technical and project documentation is maintained in the `docs/` directory.

```text
docs/
├── PRD.md
├── TECH.md
├── STRUCTURE.md
├── CONVENTIONS.md
├── TESTING.md
└── AGENTS.md
```

The documentation covers:

- Problem definition and requirements
- Product architecture
- Technical architecture
- Database structure
- API contracts
- Scoring methodology
- Conflict detection
- Consent management
- UI design
- Development conventions
- Testing strategy
- Project structure
- Future scope

---

## Hackathon

**IBM National Hackathon 2026**

**Problem Statement 2 — Community-Owned Credit Network for Agriculture & Horticulture**

Krishi Pramaan aims to create a transparent, verifiable, community-supported agricultural credit ecosystem where farmers retain ownership and control over their credit identity and supporting evidence.

---

## Disclaimer

Krishi Pramaan provides an **AI-generated assessment for decision support only**.

The credit score, repayment capacity, and recommended credit limit generated by the platform are not loan approvals or financial guarantees.

**Final lending decisions remain with the authorized financial institution.**

---

## License

This project was developed as part of the **IBM National Hackathon 2026**.
