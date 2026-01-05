import type { PillType } from '@agent-ui-monorepo/ui-pill';

type TradingType = 'risky' | 'balanced';

export const TRADING_TYPE_MAP = {
  risky: {
    displayName: 'Risky',
    type: 'danger',
  },
  balanced: {
    displayName: 'Balanced',
    type: 'primary',
  },
} satisfies Record<TradingType, { displayName: string; type: PillType }>;
