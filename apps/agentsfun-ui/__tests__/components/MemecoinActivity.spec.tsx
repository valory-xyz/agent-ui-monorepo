import { render, screen } from '@testing-library/react';

import { MemecoinActivity } from '../../src/components/MemecoinActivity';
import { useMemecoinActivity } from '../../src/hooks/useMemecoinActivity';
import { MemecoinActivity as MemecoinActivityType } from '../../src/types';

jest.mock('../../src/hooks/useMemecoinActivity');

describe('MemecoinActivity (agentsfun-ui)', () => {
  it('renders a spinner while loading', () => {
    (useMemecoinActivity as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    const { container } = render(<MemecoinActivity />);
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders an error state when the hook fails', () => {
    (useMemecoinActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    });

    render(<MemecoinActivity />);
    expect(
      screen.getByText('Failed to load memecoin activity. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('renders an empty state when there are no memecoin actions', () => {
    (useMemecoinActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: null,
    });

    render(<MemecoinActivity />);
    expect(screen.getByText(/No tokens caught the agent’s eye/)).toBeInTheDocument();
  });

  it('renders supported memecoin actions and links', () => {
    (useMemecoinActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          type: 'heart',
          timestamp: 1750099304.8088,
          postId: 'post-heart',
          token: { address: null, nonce: 1, symbol: 'MEOWC' },
        },
        {
          type: 'collect',
          timestamp: 1750099304.8088,
          postId: 'post-collect',
          token: { address: null, nonce: 2, symbol: 'DOGE' },
        },
      ],
    });

    render(<MemecoinActivity />);

    expect(screen.getByText('Recent Memecoin Activity')).toBeInTheDocument();
    expect(screen.getByText(/Agent hearted/)).toBeInTheDocument();
    expect(screen.getByText(/Agent collected/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /View on X/ })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'MEOWC' })).toHaveAttribute(
      'href',
      'https://www.agents.fun/tools',
    );
    // timestamp is always rendered for each activity row
    expect(screen.getAllByText(/^[A-Z][a-z]{2} \d{1,2}$/)).toHaveLength(2);
  });

  it('renders the remaining supported action variants', () => {
    (useMemecoinActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          type: 'summon',
          timestamp: 1750099304.8088,
          postId: 'post-summon',
          token: { address: null, nonce: 4, symbol: 'SUM' },
        },
        {
          type: 'unleash',
          timestamp: 1750099304.8088,
          postId: 'post-unleash',
          token: { address: null, nonce: 5, symbol: 'BOOST' },
        },
        {
          type: 'purge',
          timestamp: 1750099304.8088,
          postId: 'post-purge',
          token: { address: null, nonce: 6, symbol: 'ASH' },
        },
      ],
    });

    render(<MemecoinActivity />);

    expect(screen.getByText(/Agent summoned/)).toBeInTheDocument();
    expect(screen.getByText(/Agent unleashed/)).toBeInTheDocument();
    expect(screen.getByText(/Agent purged/)).toBeInTheDocument();
  });

  it('renders an unknown state for unsupported activity types', () => {
    const unknownActivity = {
      type: 'unknown',
      timestamp: 1750099304.8088,
      postId: null,
      token: { address: null, nonce: 3, symbol: 'VOID' },
    } as unknown as MemecoinActivityType;

    (useMemecoinActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [unknownActivity],
    });

    render(<MemecoinActivity />);
    expect(screen.getByText('Unknown activity type')).toBeInTheDocument();
  });
});
