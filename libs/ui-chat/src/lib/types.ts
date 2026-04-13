import { ReactNode } from 'react';

export type AgentType =
  | 'modius'
  | 'optimus'
  | 'omenstrat_trader'
  | 'agentsFun'
  | 'polystrat_trader';

export type EachChat =
  | { type: 'user'; text: string }
  | { type: 'agent' | 'system'; text: ReactNode };

export type ChatSize = 'small' | 'large';
