export type AgentInfoResponse = {
  address: `0x${string}`;
  safe_address: `0x${string}`;
  agent_ids: number[];
  service_id: number;
};

export type TraderAgent = {
  id: string;
  serviceId: number;
  firstParticipation: string;
  lastActive: string;
  totalBets: number;
  totalTraded: string;
  totalPayout: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
};

export type FpmmTrade = {
  id: string;
  creationTimestamp: number;
};

export type FpmmTrades = { fpmmTrades: FpmmTrade[] };
