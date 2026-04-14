import { render, screen } from '@testing-library/react';

import { Performance } from '../../src/components/Performance';
import { usePerformance } from '../../src/hooks/usePerformance';

jest.mock('../../src/hooks/usePerformance');

describe('Performance (agentsfun-ui)', () => {
  it('renders a spinner while loading', () => {
    (usePerformance as jest.Mock).mockReturnValue({ isLoading: true, isError: false });

    const { container } = render(<Performance />);
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders an error state when loading performance fails', () => {
    (usePerformance as jest.Mock).mockReturnValue({ isLoading: false, isError: true });

    render(<Performance />);
    expect(screen.getByText('Failed to load performance summary.')).toBeInTheDocument();
  });

  it('renders the performance metrics with formatted numbers', () => {
    (usePerformance as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      weeklyImpressions: 123456,
      weeklyLikes: 789,
      impressionsTooltip: 'Views across the last 7 days',
      likesTooltip: undefined,
    });

    const { container } = render(<Performance />);

    expect(screen.getByText('Weekly Impressions')).toBeInTheDocument();
    expect(screen.getByText('Weekly Likes')).toBeInTheDocument();
    expect(screen.getByText('123,456')).toBeInTheDocument();
    expect(screen.getByText('789')).toBeInTheDocument();
    // tooltip icon present for impressions, absent for likes (likesTooltip is undefined)
    expect(container.querySelectorAll('[aria-label="info-circle"]')).toHaveLength(1);
  });

  it('renders tooltip icons for both metrics when both tooltips are provided', () => {
    (usePerformance as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      weeklyImpressions: 0,
      weeklyLikes: 0,
      impressionsTooltip: 'Impressions tooltip',
      likesTooltip: 'Likes tooltip',
    });

    const { container } = render(<Performance />);

    expect(container.querySelectorAll('[aria-label="info-circle"]')).toHaveLength(2);
  });
});
