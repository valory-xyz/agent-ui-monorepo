import { AgentInfoResponse, TraderAgent } from '../types';

export const mockAgentInfo: AgentInfoResponse = {
  address: '0x0133b9F11F8eE185823882d2599E65ceA4c71Cd1',
  safe_address: '0xa4a205Ee2517Ead47064dc1dBA0b62Df3E425F75',
  agent_ids: [25],
  trading_type: 'risky',
} as const;

export const mockTraderInfo: TraderAgent = {
  id: '0xa4a205ee2517ead47064dc1dba0b62df3e425f75',
  serviceId: '2181',
  firstParticipation: '1749137045',
  totalBets: 346,
  totalTraded: '9510003735794488927',
  totalPayout: '3308597746093772778',
  totalFees: '95100037357944888',
  blockTimestamp: '1749133590',
  bets: [
    {
      timestamp: '1757082730',
    },
  ],
  blockNumber: '2955091',
  transactionHash: '0x5e1b2f3a4f3e4c6e8f3e4c6e8f3e4c6e8f3e4c6e8f3e4c6e8f3e4c6e8f3e4c6e',
} as const;
