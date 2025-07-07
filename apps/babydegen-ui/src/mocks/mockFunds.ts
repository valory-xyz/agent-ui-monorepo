import { Funds, WithdrawDetails } from '../types';

export const mockFunds: Funds = {
  amount: 1000,
};

export const mockWithdrawDetails: WithdrawDetails = {
  message: 'Withdrawal initiated successfully.',
  isComplete: true,
  txnLink: 'https://example.com/transaction/12345',
};
