export type AgentInfoResponse = {
  address: `0x${string}`;
  safe_address: `0x${string}`;
  agent_ids: number[];
};

export type TraderAgent = {
  id: string;
  serviceId: string;
  firstParticipation: string;
  totalBets: number;
  totalTraded: string;
  totalPayout: string;
  totalFees: string;
  bets: {
    timestamp: number;
  }[];
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
};

export type TraderAgentBets = {
  id: string;
  bets: {
    outcomeIndex: string;
    fixedProductMarketMaker: {
      id: string;
      currentAnswer: string;
    };
  }[];
};

export type GetUserTradesParams = {
  creator: string;
  first: number;
  skip: number;
  orderBy: string;
  orderDirection: string;
};

export type Fpmm = {
  id: string;
  outcomes: string[];
  currentAnswer: string;
  openingTimestamp: number;
};

export type FpmmTrade = {
  id: string;
  collateralAmountUSD: string;
  creationTimestamp: number;
  outcomeIndex: number;
  fpmm: Fpmm;
  title: string | null;
  transactionHash: string;
};

export type FpmmTrades = { fpmmTrades: FpmmTrade[] };

export type GetMechSenderParams = {
  id: string;
  timestamp_gt: number;
};

export type MechSender = {
  totalRequests: number;
  requests: {
    id: string;
    questionTitle: string;
  }[];
};

export type Question = {
  id: string;
  question: string;
};

export type Service = {
  id: string;
  olasRewardsEarned: string;
};
