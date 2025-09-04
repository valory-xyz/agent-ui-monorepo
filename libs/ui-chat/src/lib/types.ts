import { ReactNode } from 'react';

export type AgentType = 'modius' | 'optimus' | 'predict';

export type EachChat = {
  text: ReactNode;
  type: 'user' | 'agent' | 'system';
};
