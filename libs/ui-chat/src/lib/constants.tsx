import agentsFunLogo from '../assets/agentsfun-chat.png';
import modiusLogo from '../assets/modius-chat.png';
import traderLogo from '../assets/omenstrat-chat.png';
import optimusLogo from '../assets/optimus-chat.png';
import polystratTraderLogo from '../assets/polystrat-chat.png';
import { AgentType } from './types';

export const LOGO_MAP: Record<AgentType, string> = {
  modius: modiusLogo,
  optimus: optimusLogo,
  omenstrat_trader: traderLogo,
  polystrat_trader: polystratTraderLogo,
  agentsFun: agentsFunLogo,
} as const;
