import { LEADERBOARD_PAGE_URL } from '../constants/urls';
import { AgentLeaderboardResponse, LeaderboardWindow, NotRankedReason } from '../types';

const AGENT_ID = '0x0123456789abcdef0123456789abcdef01234567';

type MockScenario = 'ranked' | NotRankedReason | 'unavailable';

/** Dev-mock scenario, picked with `?leaderboard=<scenario>` in the URL. */
const getScenario = (window: LeaderboardWindow): MockScenario => {
  const param = new URLSearchParams(globalThis.location?.search).get('leaderboard');
  if (param === 'not_ranked_yet' || param === 'not_eligible' || param === 'unavailable') {
    return param;
  }
  if (param === 'not_enough_trades_in_window') return window === '7d' ? param : 'ranked';
  return window === '90d' ? 'not_enough_trades_in_window' : 'ranked';
};

export const getMockLeaderboard = (window: LeaderboardWindow): AgentLeaderboardResponse => {
  const scenario = getScenario(window);
  const base: AgentLeaderboardResponse = {
    agent_id: AGENT_ID,
    agent_type: 'omenstrat',
    window,
    status: 'unavailable',
    rank_by_roi: null,
    rank_by_pnl: null,
    total_ranked: null,
    not_ranked_reason: null,
    leaderboard_url: LEADERBOARD_PAGE_URL,
    last_updated: null,
  };

  if (scenario === 'unavailable') return base;

  const deepLink = `${LEADERBOARD_PAGE_URL}?agentType=omenstrat&rankBy=roi&window=${window}&pin=${AGENT_ID}`;
  const last_updated = '2026-10-08T12:00:00Z';

  if (scenario === 'ranked') {
    return {
      ...base,
      status: 'ranked',
      rank_by_roi: 124,
      rank_by_pnl: 114,
      total_ranked: 242,
      leaderboard_url: deepLink,
      last_updated,
    };
  }

  return {
    ...base,
    status: 'not_ranked',
    not_ranked_reason: scenario,
    leaderboard_url: deepLink,
    last_updated,
  };
};
