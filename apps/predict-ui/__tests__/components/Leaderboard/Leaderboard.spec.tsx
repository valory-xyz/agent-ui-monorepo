import { fireEvent, render, screen } from '@testing-library/react';

import { getLeaderboardState, Leaderboard } from '../../../src/components/Leaderboard/Leaderboard';
import { LEADERBOARD_PAGE_URL } from '../../../src/constants/urls';
import { useLeaderboard } from '../../../src/hooks/useLeaderboard';
import { AgentLeaderboardResponse, NotRankedReason } from '../../../src/types';

jest.mock('../../../src/hooks/useLeaderboard');

const DEEP_LINK =
  'https://predict.olas.network/leaderboard?agentType=omenstrat&rankBy=roi&window=7d&pin=0xabc';

const ranked: AgentLeaderboardResponse = {
  agent_id: '0xabc',
  agent_type: 'omenstrat',
  window: '7d',
  status: 'ranked',
  rank_by_roi: 114,
  rank_by_pnl: 124,
  total_ranked: 242,
  not_ranked_reason: null,
  leaderboard_url: DEEP_LINK,
  last_updated: '2026-10-08T12:00:00Z',
};

const notRanked = (reason: NotRankedReason | null): AgentLeaderboardResponse => ({
  ...ranked,
  status: 'not_ranked',
  rank_by_roi: null,
  rank_by_pnl: null,
  total_ranked: null,
  not_ranked_reason: reason,
});

const unavailable: AgentLeaderboardResponse = {
  ...notRanked(null),
  status: 'unavailable',
  leaderboard_url: LEADERBOARD_PAGE_URL,
  last_updated: null,
};

const mockHook = (value: {
  data?: AgentLeaderboardResponse;
  isLoading?: boolean;
  isError?: boolean;
}) =>
  (useLeaderboard as jest.Mock).mockReturnValue({
    isLoading: false,
    isError: false,
    ...value,
  });

const getButton = () => screen.queryByRole('link', { name: /see full leaderboard/i });

describe('getLeaderboardState', () => {
  it.each<[string, AgentLeaderboardResponse | undefined, boolean, boolean, object]>([
    ['loading', undefined, true, false, { kind: 'loading' }],
    [
      'ranked',
      ranked,
      false,
      false,
      { kind: 'ranked', rankByRoi: 114, rankByPnl: 124, total: 242 },
    ],
    ['not_ranked_yet', notRanked('not_ranked_yet'), false, false, { kind: 'not_ranked_yet' }],
    [
      'not_enough_trades_in_window',
      notRanked('not_enough_trades_in_window'),
      false,
      false,
      { kind: 'not_enough_trades' },
    ],
    ['not_eligible', notRanked('not_eligible'), false, false, { kind: 'not_ranked_yet' }],
    ['not_ranked without a reason', notRanked(null), false, false, { kind: 'not_ranked_yet' }],
    ['unavailable', unavailable, false, false, { kind: 'unavailable' }],
    ['a request error', undefined, false, true, { kind: 'unavailable' }],
    ['no data', undefined, false, false, { kind: 'unavailable' }],
    [
      'ranked with a missing rank',
      { ...ranked, rank_by_pnl: null },
      false,
      false,
      { kind: 'unavailable' },
    ],
  ])('maps %s', (_, data, isLoading, isError, expected) => {
    expect(getLeaderboardState(data, isLoading, isError)).toEqual(expected);
  });
});

describe('Leaderboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requests 7D by default and refetches with the selected window', () => {
    mockHook({ data: ranked });
    render(<Leaderboard />);

    expect(useLeaderboard).toHaveBeenLastCalledWith({ window: '7d' });
    ['7D', '30D', '90D', '1Y'].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('1Y'));
    expect(useLeaderboard).toHaveBeenLastCalledWith({ window: '1y' });

    fireEvent.click(screen.getByText('30D'));
    expect(useLeaderboard).toHaveBeenLastCalledWith({ window: '30d' });
  });

  it('shows skeletons and keeps the window control while loading', () => {
    mockHook({ isLoading: true });
    render(<Leaderboard />);

    expect(screen.getByTestId('leaderboard-skeleton')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(getButton()).not.toBeInTheDocument();
  });

  it('shows both ranks as "#N of M" and the deep link', () => {
    mockHook({ data: ranked });
    render(<Leaderboard />);

    expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument();
    expect(screen.getByText('Rank by ROI')).toBeInTheDocument();
    expect(screen.getByText('Rank by PnL')).toBeInTheDocument();
    expect(screen.getByText('114')).toBeInTheDocument();
    expect(screen.getByText('124')).toBeInTheDocument();
    expect(screen.getAllByText('#')).toHaveLength(2);
    expect(screen.getAllByText('of 242')).toHaveLength(2);

    const button = getButton();
    expect(button).toHaveAttribute('href', DEEP_LINK);
    expect(button).toHaveAttribute('target', '_blank');
    expect(button).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows "Not ranked yet" without the window control or button', () => {
    mockHook({ data: notRanked('not_ranked_yet') });
    render(<Leaderboard />);

    expect(screen.getByText('Not ranked yet.')).toBeInTheDocument();
    expect(
      screen.getByText('Keep your agent running. It gets ranked after enough trades.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('7D')).not.toBeInTheDocument();
    expect(getButton()).not.toBeInTheDocument();
  });

  it('shows "Not enough trades in this period" with the window control', () => {
    mockHook({ data: notRanked('not_enough_trades_in_window') });
    render(<Leaderboard />);

    expect(screen.getByText('Not enough trades in this period.')).toBeInTheDocument();
    expect(
      screen.getByText("Try a different period to see your agent's rank."),
    ).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(getButton()).not.toBeInTheDocument();
  });

  it('shows "Rank unavailable right now" with the agent URL when unavailable', () => {
    mockHook({ data: unavailable });
    render(<Leaderboard />);

    expect(screen.getByText('Rank unavailable right now.')).toBeInTheDocument();
    expect(screen.getByText('Please check back later.')).toBeInTheDocument();
    expect(screen.queryByText('7D')).not.toBeInTheDocument();
    expect(getButton()).toHaveAttribute('href', LEADERBOARD_PAGE_URL);
  });

  it('shows "Rank unavailable right now" with the fallback URL when the request fails', () => {
    mockHook({ isError: true });
    render(<Leaderboard />);

    expect(screen.getByText('Rank unavailable right now.')).toBeInTheDocument();
    expect(getButton()).toHaveAttribute('href', LEADERBOARD_PAGE_URL);
  });

  it('hides the button when there is no URL', () => {
    mockHook({});
    render(<Leaderboard />);

    expect(screen.getByText('Rank unavailable right now.')).toBeInTheDocument();
    expect(getButton()).not.toBeInTheDocument();
  });
});
