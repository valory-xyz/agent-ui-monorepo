import { ReactNode } from 'react';

export type AgentType = 'modius' | 'optimus' | 'trader' | 'agentsFun' | 'polymarket_trader';

export type EachChat = {
  text: ReactNode;
  type: 'user' | 'agent' | 'system';
};

export type ChatSize = 'small' | 'large';
