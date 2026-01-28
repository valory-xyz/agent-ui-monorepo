export const AgentType = {
  predict: 'predict',
  modius: 'modius',
  optimus: 'optimus',
  agentsFun: 'agentsFun',
  polystrat_trader: 'polystrat_trader',
  omenstrat_trader: 'omenstrat_trader',
} as const;

export type AgentType = (typeof AgentType)[keyof typeof AgentType];
