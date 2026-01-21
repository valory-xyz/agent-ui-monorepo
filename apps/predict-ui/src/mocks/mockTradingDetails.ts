import { TradingDetailsResponse } from '../types';

export const mockTradingDetails: TradingDetailsResponse = {
  agent_id: '0xa4a205ee2517ead47064dc1dba0b62df3e425f75',
  trading_type: 'risky',
  trading_type_description:
    'Aggressively pursuing high rewards using the Kelly criterion for dynamic bet sizing.',
} as const;
