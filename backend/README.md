# Vittiya Disha Backend

Deterministic, auditable scheme recommendation API for NBCFDC, NSFDC, and NSKFDC. The frontend submits assessment facts; this service validates and normalizes them, evaluates all active scheme definitions, calculates financial terms, ranks matches deterministically, and optionally asks Nemotron only to explain the result.

## Run

```powershell
cd backend
yarn install
yarn dev
```

The default server is `http://localhost:5000`. Copy `.env.example` to `.env` to configure the port, CORS origin, or optional Nemotron-compatible endpoint.

## Deploy on Render

Create a **Web Service** with these settings:

- Root directory: `backend`
- Runtime: `Node`
- Build command: `yarn install`
- Start command: `yarn start`

Add `CORS_ORIGIN` as an environment variable containing the deployed frontend URL. Render provides `PORT` automatically, and the backend health check is available at `/health`.

## API

`GET /health`

`POST /api/schemes/recommend`

```json
{
  "corporation": "NBCFDC",
  "profile": { "category": "OBC", "caste_certificate": true, "annual_family_income": 250000 },
  "requirement": { "purpose": "business", "project_cost": 800000, "loan_required": 680000 }
}
```

The response contains `recommendation.scheme_code`, status, auditable rule results, financial calculations, estimated EMI metadata, alternatives, an audit object, and a final-approval disclaimer. `ELIGIBLE` means the supplied deterministic conditions passed; it is never a guarantee of government approval. Missing required facts produce `NEEDS_VERIFICATION`, while contradictory known facts produce `NOT_ELIGIBLE`.

Additional endpoints:

- `POST /api/financial/calculate` calculates financing for a known project cost and scheme.
- `POST /api/financial/estimate` estimates business setup cost, then calculates financing.
- `POST /api/business/estimate` returns deterministic low/base/high setup scenarios and component provenance.
- `GET /api/financial/scheme/:schemeId` returns the versioned financial configuration.
- `GET /api/lenders?district=Jalgaon&schemeId=NSFDC_TERM_LOAN` returns matching directory partners. Charges unavailable in the source remain `null`.
- `POST /api/assessment/financial-recommendation` composes the existing scheme router, cost estimator, financial engine, and lender matcher.

Financial responses distinguish `schemeFinancingCapacity`, `schemeMaximumLoan`, `eligibleLoan`, `beneficiaryContribution`, `userContribution`, `fundingGap`, and contribution surplus/shortfall. EMI is returned only for a fixed configured rate and is always marked as an estimate. Rate ranges are returned without inventing a scenario rate.

## Architecture

`SchemeRepository` reads the configuration registry. `SchemeEngine` evaluates generic structured rules, computes financial terms, and delegates deterministic ranking to `ranking-engine.js`. The 17 scheme definitions live under `src/schemes/{nbcfdc,nsfdc,nskfdc}` and can later be replaced by a PostgreSQL repository without changing the engine contract.

Financial calculations are centralized. EMI is explicitly an estimate, not an official repayment schedule. Rate ranges and maximum rates remain ranges or maximums rather than invented single values.

Nemotron is isolated behind `NemotronProvider`. It receives the deterministic result and can produce explanation JSON only. Provider failure, malformed output, or contradictory language cannot change the recommendation; the service falls back to a deterministic template.

## Add a scheme

Add a definition to the relevant corporation module with metadata, structured eligibility rules, financial rules, interest rules, repayment rules, document requirements, verification conditions, and source reference. Ensure its purpose and rules are covered by engine tests.

## Tests

```powershell
npm test
```

Do not place API keys in source control. This is decision support, not an approval or legal determination; users must complete official document and channel-partner verification.
