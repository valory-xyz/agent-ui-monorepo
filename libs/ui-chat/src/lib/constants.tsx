import agentsFunLogo from '../assets/agentsfun-chat.png';
import modiusLogo from '../assets/modius-chat.png';
import traderLogo from '../assets/omenstrat-chat.png';
import optimusLogo from '../assets/optimus-chat.png';
import polymarketTraderLogo from '../assets/polystrat-chat.png';
import { AgentType } from './types';

export const LOGO_MAP: Record<AgentType, string> = {
  modius: modiusLogo,
  optimus: optimusLogo,
  omenstrat_trader: traderLogo,
  polymarket_trader: polymarketTraderLogo,
  agentsFun: agentsFunLogo,
} as const;
