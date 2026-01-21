export const AgentType = {
  predict: 'predict',
  modius: 'modius',
  optimus: 'optimus',
  agentsFun: 'agentsFun',
  polymarket_trader: 'polymarket_trader',
} as const;

export type AgentType = (typeof AgentType)[keyof typeof AgentType];
