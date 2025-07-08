import { Funds, WithdrawDetails } from '../types';

export const mockFunds: Funds = {
  amount: 1000000000,
  total_value_usd: 1000,
  asset_breakdown: [
    {
      token_symbol: 'ETH',
      value: 0.5, // 0.5 ETH
      value_usd: 750.0, // Worth $750
    },
    {
      token_symbol: 'USDC',
      value: 500.0, // 500 USDC
      value_usd: 500.0, // Worth $500
    },
    {
      token_symbol: 'USDT',
      value: 250.0, // 250 USDT
      value_usd: 250.0, // Worth $250
    },
  ],
} as const;

export const mockWithdrawDetails: WithdrawDetails = {
  message: 'Withdrawal initiated successfully.',
  isComplete: true,
  txnLink: 'https://example.com/transaction/12345',
};
