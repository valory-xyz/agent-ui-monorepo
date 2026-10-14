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
const getPeriod = (label: string) => screen.getByRole('radio', { name: label });

describe('getLeaderboardState', () => {
  const rankedState = {
    kind: 'ranked',
    rankByRoi: 114,
    rankByPnl: 124,
    total: 242,
  };

  it.each<[string, AgentLeaderboardResponse | undefined, boolean, object]>([
    ['no data yet', undefined, false, { kind: 'loading' }],
    ['ranked', ranked, false, rankedState],
    ['a failed refetch with cached data', ranked, true, rankedState],
    ['not_ranked_yet', notRanked('not_ranked_yet'), false, { kind: 'not_ranked_yet' }],
    [
      'not_enough_trades_in_window',
      notRanked('not_enough_trades_in_window'),
      false,
      { kind: 'not_enough_trades_in_window' },
    ],
    ['not_eligible', notRanked('not_eligible'), false, { kind: 'not_eligible' }],
    ['not_ranked without a reason', notRanked(null), false, { kind: 'not_ranked_yet' }],
    [
      'an unknown reason',
      notRanked('new_reason' as NotRankedReason),
      false,
      { kind: 'unavailable' },
    ],
    ['unavailable', unavailable, false, { kind: 'unavailable' }],
    ['a request error', undefined, true, { kind: 'unavailable' }],
    [
      'ranked with a missing rank',
      { ...ranked, rank_by_pnl: null },
      false,
      { kind: 'unavailable' },
    ],
  ])('maps %s', (_, data, isError, expected) => {
    expect(getLeaderboardState(data, isError)).toEqual(expected);
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

    expect(getPeriod('7D')).toBeChecked();

    fireEvent.click(screen.getByText('1Y'));
    expect(useLeaderboard).toHaveBeenLastCalledWith({ window: '1y' });
    expect(getPeriod('1Y')).toBeChecked();
    expect(getPeriod('7D')).not.toBeChecked();

    fireEvent.click(screen.getByText('30D'));
    expect(useLeaderboard).toHaveBeenLastCalledWith({ window: '30d' });
    expect(getPeriod('30D')).toBeChecked();
  });

  it('keeps the toggle on an unavailable period and hides it on switching to not eligible', () => {
    const byWindow = {
      '7d': ranked,
      '1y': unavailable,
      '30d': notRanked('not_eligible'),
    };
    (useLeaderboard as jest.Mock).mockImplementation(({ window }) => ({
      data: byWindow[window as keyof typeof byWindow],
      isLoading: false,
      isError: false,
    }));
    render(<Leaderboard />);

    fireEvent.click(screen.getByText('1Y'));
    expect(screen.getByText('Rank unavailable right now.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('7D'));
    expect(screen.getByText('114')).toBeInTheDocument();

    fireEvent.click(screen.getByText('30D'));
    expect(screen.getByText('Not eligible for the leaderboard.')).toBeInTheDocument();
    expect(screen.queryByText('7D')).not.toBeInTheDocument();
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

  it('shows "Not eligible" without the window control or button', () => {
    mockHook({ data: notRanked('not_eligible') });
    render(<Leaderboard />);

    expect(screen.getByText('Not eligible for the leaderboard.')).toBeInTheDocument();
    expect(
      screen.getByText("This agent doesn't meet the leaderboard requirements."),
    ).toBeInTheDocument();
    expect(screen.queryByText('7D')).not.toBeInTheDocument();
    expect(getButton()).not.toBeInTheDocument();
  });

  it('shows "Rank unavailable right now" with the agent URL when unavailable', () => {
    mockHook({ data: unavailable });
    render(<Leaderboard />);

    expect(screen.getByText('Rank unavailable right now.')).toBeInTheDocument();
    expect(screen.getByText('Please check back later.')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(getButton()).toHaveAttribute('href', LEADERBOARD_PAGE_URL);
  });

  it('shows "Rank unavailable right now" with the fallback URL when the request fails', () => {
    mockHook({ isError: true });
    render(<Leaderboard />);

    expect(screen.getByText('Rank unavailable right now.')).toBeInTheDocument();
    expect(getButton()).toHaveAttribute('href', LEADERBOARD_PAGE_URL);
  });

  it('keeps the cached rank when a background refetch fails', () => {
    mockHook({ data: ranked, isError: true });
    render(<Leaderboard />);

    expect(screen.getByText('114')).toBeInTheDocument();
    expect(screen.queryByText('Rank unavailable right now.')).not.toBeInTheDocument();
    expect(getButton()).toHaveAttribute('href', DEEP_LINK);
  });

  it('hides the button when there is no URL', () => {
    mockHook({ data: { ...ranked, rank_by_roi: null, leaderboard_url: '' } });
    render(<Leaderboard />);

    expect(screen.getByText('Rank unavailable right now.')).toBeInTheDocument();
    expect(getButton()).not.toBeInTheDocument();
  });
});
