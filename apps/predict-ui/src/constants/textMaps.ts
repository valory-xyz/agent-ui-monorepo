import type { PillType } from '@agent-ui-monorepo/ui-pill';

type TradingType = 'risky' | 'balanced';

export const TRADING_TYPE_MAP: Record<
  TradingType,
  { displayName: string; type: PillType; description: string }
> = {
  risky: {
    displayName: 'Risky',
    type: 'danger',
    description:
      'Aggressively pursuing high rewards using the Kelly criterion for dynamic bet sizing.',
  },
  balanced: {
    displayName: 'Balanced',
    type: 'primary',
    description: 'Moderate risk strategy balancing profit and safety.',
  },
};
