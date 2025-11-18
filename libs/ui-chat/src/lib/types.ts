import { ReactNode } from 'react';

export type AgentType = 'modius' | 'optimus' | 'predict' | 'agentsFun';

export type EachChat = {
  text: ReactNode;
  type: 'user' | 'agent' | 'system';
};

export type ChatSize = 'small' | 'large';
