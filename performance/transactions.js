import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp-up: gradually increase to 10 VUs
    { duration: '1m', target: 10 },  // Steady state: maintain 10 VUs
    { duration: '30s', target: 0 },  // Ramp-down: gradually return to 0 VUs
  ],

  thresholds: {
    // Assumption for the assessment: 95% of requests should complete within 500 ms.
    http_req_duration: ['p(95)<500'],

    // Assumption for the assessment: less than 1% of requests should fail.
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const url = `${__ENV.BASE_URL}/wallet/${__ENV.WALLET_ID}/transaction`;

  const payload = JSON.stringify({
    currency: 'EUR',
    amount: 1,
    type: 'credit',
  });

  const response = http.post(url, payload, {
    headers: {
      Authorization: `Bearer ${__ENV.TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    // The transaction endpoint is expected to return HTTP 200
    // according to the OpenAPI specification.
    'status is 200': (r) => r.status === 200,

    // Verify that a transaction ID is returned for a successful request.
    'transactionId is returned': (r) => {
      if (!r.body) {
        return false;
      }

      try {
        return Boolean(r.json('transactionId'));
      } catch {
        return false;
      }
    },
  });

  // Simulate a short pause between user actions.
  sleep(1);
}