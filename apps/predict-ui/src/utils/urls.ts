import { POLYMARKET_PROFILE_BASE_URL } from '../constants/urls';

export const getPolymarketProfileUrl = (agentSafeAddress?: string) =>
  agentSafeAddress ? `${POLYMARKET_PROFILE_BASE_URL}/${agentSafeAddress}` : undefined;
