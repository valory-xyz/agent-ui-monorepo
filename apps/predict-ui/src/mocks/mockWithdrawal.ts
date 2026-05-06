import { WithdrawalInitiateResponse, WithdrawalStatus } from '../types';

export const mockWithdrawInitiateResponse: WithdrawalInitiateResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  status: 'completed',
} as const;

export const mockWithdrawStatusResponse: WithdrawalStatus = {
  status: 'completed',
  message: 'Withdrawal completed successfully.',
  transaction_link: 'https://etherscan.io/tx/0x1234567890abcdef',
} as const;
