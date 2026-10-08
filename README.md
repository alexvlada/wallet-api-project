# Wallet API Testing Suite

API automation suite for the Wallet API challenge, implemented with **Playwright, TypeScript, and k6**.

The API is hypothetical and no live environment was provided. The OpenAPI specification is therefore treated as the source of truth.

## Tech Stack

* Node.js
* TypeScript
* Playwright Test
* k6
* dotenv

## Project Structure

```text
wallet-api-project/
├── api-objects/
│   ├── auth-api.ts
│   ├── transaction-api.ts
│   ├── types.ts
│   └── wallet-api.ts
├── data/
│   └── transaction-data.ts
├── performance/
│   ├── run-performance.js
│   └── transactions.js
├── tests/
│   └── transactions.spec.ts
├── utils/
│   ├── create-and-wait-for-transaction.ts
│   └── wait-for-transaction.ts
├── .env
├── .gitignore
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## Setup

Requirements:

* Node.js
* npm
* k6

Install project dependencies:

```bash
npm install
```

This installs Playwright Test and the other Node.js dependencies defined in `package.json`.

No Playwright browsers are required because the suite uses Playwright for API testing only.

Create a local `.env` file:

```env
BASE_URL=https://challenge.test.local/challenge/api/v1
USERNAME=mock-user
PASSWORD=mock-password
SERVICE_ID=mock-service
TOKEN=mock-token
WALLET_ID=550e8400-e29b-41d4-a716-446655440000
```

The `.env` file is excluded from version control.

## Running Tests

### Functional API tests

```bash
npm test
```

The suite is intentionally executed sequentially because several tests use the state created by previous tests.

### Performance test

```bash
npm run test:performance
```

The k6 test targets:

```text
POST /wallet/{walletId}/transaction
```

It uses a staged workload of:

* 30s ramp-up to 10 VUs
* 1 min at 10 VUs
* 30s ramp-down

The performance thresholds are assessment assumptions because no official performance targets are defined in the specification.

## Test Coverage

| ID   | Test Case                             | Priority |
| ---- | ------------------------------------- | -------- |
| TC01 | Valid credit and balance verification | P0       |
| TC02 | Valid debit and balance verification  | P0       |
| TC03 | Prevent negative wallet balance       | P0       |
| TC04 | POST / GET transaction consistency    | P0       |
| TC05 | Transaction history / pagination      | P1       |
| TC06 | Reject negative amount                | P1       |
| TC07 | Multi-currency balance isolation      | P1       |
| TC08 | Transaction performance               | P1       |

Additional important scenarios identified but not implemented are documented in `TESTPLAN.md`, including pending transaction timeout, concurrent debits/double spending, and long-duration stability testing.

## Assumptions & Limitations

* Authentication is assumed to work correctly, as stated in the challenge. A bearer token is supplied through `.env`.
* Transactions may be immediately completed or enter `pending`; the automation polls until `finished`.
* The exact HTTP status for invalid input is not defined by the OpenAPI specification, so TC06 does not assume a specific error status.
* The functional tests use a shared wallet and are intentionally sequential.
* No live API environment was provided, so actual functional and performance results require a reachable API implementation.

## AI / LLM Usage

**Model:** GPT-5.6 Luna

AI assistance was used for test design discussions, API automation structure, code review, debugging, and documentation.

All generated suggestions and code were reviewed, adapted, and validated by the candidate.
