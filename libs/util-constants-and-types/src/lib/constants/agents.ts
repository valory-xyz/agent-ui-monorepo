export const AgentType = {
  predict: 'predict',
  modius: 'modius',
  optimus: 'optimus',
  agentsFun: 'agentsFun',
} as const;

export type AgentType = (typeof AgentType)[keyof typeof AgentType];
