# Wallet API Test Plan

## Implemented Test Cases

| ID   | Test Case                                           | Priority |
| ---- | --------------------------------------------------- | -------- |
| TC01 | Create valid credit transaction and verify balance  | P0       |
| TC02 | Create valid debit transaction and verify balance   | P0       |
| TC03 | Prevent negative wallet balance                     | P0       |
| TC04 | Verify transaction consistency between POST and GET | P0       |
| TC05 | Verify transaction history and pagination           | P1       |
| TC06 | Reject transaction with negative amount             | P1       |
| TC07 | Verify multi-currency balance isolation             | P1       |
| TC08 | Performance test for transaction creation           | P1       |

## Unimplemented Test Cases

### TC09 – Pending transaction / automatic rejection after 30 minutes

**Priority:** P0

**Scenario:**
Create a transaction that enters `pending` state and verify that it eventually becomes `finished` with an unsuccessful/denied outcome after the defined 30-minute timeout.

**Why important:**
The API specification explicitly defines automatic rejection after 30 minutes, making this a critical business rule.

**Why not implemented:**
A real 30-minute wait would make the automated test suite impractical. A controllable clock, test hook, or time-simulation mechanism would be required.

### TC10 – Concurrent debit transactions / double spending

**Priority:** P1

**Scenario:**
Start with a known wallet balance and submit two debit transactions concurrently where both individually fit within the balance, but their combined amount exceeds it.

**Expected result:**
The system must prevent the wallet balance from becoming negative. The combined effect of the concurrent transactions must respect the wallet balance invariant.

**Why important:**
This is a critical financial integrity and concurrency scenario that cannot be reliably covered by sequential tests.

**Why not implemented:**
The challenge does not provide a mechanism for controlling the initial balance or guaranteeing deterministic concurrency behavior.

### TC11 – Long-duration performance / stability

**Priority:** P1

**Scenario:**
Execute a sustained stream of transactions for an extended period while monitoring throughput, error rate, and response-time percentiles.

**Expected result:**
The API should maintain stable behavior without increasing error rates or unacceptable latency degradation.

**Why not implemented:**
This requires a dedicated performance environment and a longer-running workload than is appropriate for the functional challenge suite.
