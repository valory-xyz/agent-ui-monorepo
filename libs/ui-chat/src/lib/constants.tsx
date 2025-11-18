import modiusLogo from '../assets/modius-chat.png';
import optimusLogo from '../assets/optimus-chat.png';
import traderLogo from '../assets/predict-chat.png';
import agentsFunLogo from '../assets/agentsfun-chat.png';
import { AgentType } from './types';

export const LOGO_MAP: Record<AgentType, string> = {
  modius: modiusLogo,
  optimus: optimusLogo,
  predict: traderLogo,
  agentsFun: agentsFunLogo,
} as const;
