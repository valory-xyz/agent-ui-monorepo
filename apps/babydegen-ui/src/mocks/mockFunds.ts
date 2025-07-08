import { Funds, WithdrawalStatus, WithdrawInitiateResponse } from '../types';

export const mockFunds: Funds = {
  amount: 1000000000,
  total_value_usd: 1000,
  asset_breakdown: [
    {
      token_symbol: 'ETH',
      value: 0.5,
      value_usd: 750.0, // Worth $750
    },
    {
      token_symbol: 'USDC',
      value: 500.0,
      value_usd: 500.0, // Worth $500
    },
    {
      token_symbol: 'USDT',
      value: 250.0,
      value_usd: 250.0, // Worth $250
    },
  ],
} as const;

export const mockWithdrawInitiateResponse: WithdrawInitiateResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  status: 'initiated',
  target_address: '0x9876543210987654321098765432109876543210',
  estimated_value_usd: 1500.0,
  chain: 'mode',
};

export const mockWithdrawStatusResponse: WithdrawalStatus = {
  status: 'pending',
  message: 'Withdrawal request received and validated',
  target_address: '0x9876543210987654321098765432109876543210',
  chain: 'optimism',
  safe_address: '0x1234567890123456789012345678901234567890',
  requested_at: '1703123456',
  estimated_value_usd: 1500.0,
  transaction_link: 'https://example.com/transaction/67890',
};
