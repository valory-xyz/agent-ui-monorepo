import { render, screen } from '@testing-library/react';

import { XActivity } from '../../src/components/XActivity';
import { useXActivity } from '../../src/hooks/useXActivity';

jest.mock('../../src/hooks/useXActivity');

describe('XActivity (agentsfun-ui)', () => {
  it('renders a spinner while loading', () => {
    (useXActivity as jest.Mock).mockReturnValue({ isLoading: true, isError: false, data: null });

    const { container } = render(<XActivity />);
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders an error state when the hook fails', () => {
    (useXActivity as jest.Mock).mockReturnValue({ isLoading: false, isError: true, data: null });

    render(<XActivity />);
    expect(
      screen.getByText('Failed to load recent activity. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('renders an empty state when there is no activity', () => {
    (useXActivity as jest.Mock).mockReturnValue({ isLoading: false, isError: false, data: null });

    render(<XActivity />);
    expect(screen.getByText(/Nothing to show here/)).toBeInTheDocument();
  });

  it('renders the latest X post details when data exists', () => {
    (useXActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        postId: 'post-123',
        text: 'A post with #hashtags and an image',
        timestamp: 1750099304.8088,
        media: ['https://cdn.example.com/1.png'],
        type: 'post',
      },
    });

    render(<XActivity />);

    expect(screen.getByText('Recent X Activity')).toBeInTheDocument();
    expect(screen.getByText('Agent posted a message')).toBeInTheDocument();
    expect(screen.getByText('#hashtags')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View on X/ })).toHaveAttribute(
      'href',
      'https://x.com/i/web/status/post-123',
    );
    expect(screen.getByAltText('Media 1')).toBeInTheDocument();
  });

  it('renders multiple media images with sequential alt text', () => {
    (useXActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        postId: 'post-multi',
        text: 'A post with two images',
        timestamp: 0,
        media: ['https://cdn.example.com/1.png', 'https://cdn.example.com/2.png'],
        type: 'post',
      },
    });

    render(<XActivity />);

    expect(screen.getByAltText('Media 1')).toBeInTheDocument();
    expect(screen.getByAltText('Media 2')).toBeInTheDocument();
  });

  it('skips timestamp and media rendering when those fields are falsy', () => {
    (useXActivity as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        postId: 'post-456',
        text: '',
        timestamp: 0,
        media: null,
        type: 'post',
      },
    });

    render(<XActivity />);

    expect(screen.queryByText(/[A-Z][a-z]{2} \d{1,2}/)).toBeNull();
    expect(screen.queryByAltText('Media 1')).toBeNull();
  });
});
