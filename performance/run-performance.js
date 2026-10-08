require('dotenv').config();
const { execFileSync } = require('child_process');

const env = {
  ...process.env,
  BASE_URL: process.env.BASE_URL,
  WALLET_ID: process.env.WALLET_ID,
  TOKEN: process.env.TOKEN,
};

// Load environment variables from .env and pass them to the k6 process.
execFileSync(
  'k6',
  ['run', 'performance/transactions.js'],
  {
    stdio: 'inherit',
    env,
  }
);