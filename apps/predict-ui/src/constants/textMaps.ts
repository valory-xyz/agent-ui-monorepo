import type { PillType } from '@agent-ui-monorepo/ui-pill';

type TradingType = 'risky' | 'balanced';

export const TRADING_TYPE_MAP: Record<
  TradingType,
  { displayName: string; type: PillType; }
> = {
  risky: {
    displayName: 'Risky',
    type: 'danger',
  },
  balanced: {
    displayName: 'Balanced',
    type: 'primary',
  },
};
