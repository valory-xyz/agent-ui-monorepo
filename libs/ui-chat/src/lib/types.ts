import { ReactNode } from 'react';

export type AgentType =
  | 'modius'
  | 'optimus'
  | 'omenstrat_trader'
  | 'agentsFun'
  | 'polystrat_trader';

export type EachChat = {
  text: ReactNode;
  type: 'user' | 'agent' | 'system';
};

export type ChatSize = 'small' | 'large';
