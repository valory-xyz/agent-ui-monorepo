import { fireEvent, render, screen } from '@testing-library/react';

import { AiGeneratedMedia } from '../../src/components/AiGeneratedMedia';
import { useGeneratedMedia } from '../../src/hooks/useGeneratedMedia';
import { GeneratedMedia } from '../../src/types';

jest.mock('../../src/hooks/useGeneratedMedia');

describe('AiGeneratedMedia (agentsfun-ui)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'open').mockImplementation(() => null);
    jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a spinner while loading', () => {
    (useGeneratedMedia as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    const { container } = render(<AiGeneratedMedia />);
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders an error state when the hook fails', () => {
    (useGeneratedMedia as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    });

    render(<AiGeneratedMedia />);
    expect(screen.getByText('Failed to load media. Please try again later.')).toBeInTheDocument();
  });

  it('renders an empty state when there is no generated media', () => {
    (useGeneratedMedia as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    render(<AiGeneratedMedia />);
    expect(screen.getByText('No media generated yet.')).toBeInTheDocument();
    expect(screen.getByText('Your agent is still gathering inspiration.')).toBeInTheDocument();
  });

  it('renders image and video media and opens the X post on click', () => {
    (useGeneratedMedia as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { path: 'https://cdn.example.com/1.png', postId: 'post-image', type: 'image' },
        { path: 'https://cdn.example.com/1.mp4', postId: 'post-video', type: 'video' },
      ],
    });

    render(<AiGeneratedMedia />);

    expect(screen.getByText('AI Generated Media')).toBeInTheDocument();

    fireEvent.click(screen.getByAltText('Generated media 1'));
    const videoElement = document.querySelector('video');
    if (!videoElement) throw new Error('Expected a video element');
    fireEvent.click(videoElement);

    expect(window.open).toHaveBeenCalledWith('https://x.com/i/web/status/post-image', '_blank');
    expect(window.open).toHaveBeenCalledWith('https://x.com/i/web/status/post-video', '_blank');
  });

  it('numbers alt text sequentially for multiple images', () => {
    (useGeneratedMedia as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { path: 'https://cdn.example.com/1.png', postId: 'p1', type: 'image' },
        { path: 'https://cdn.example.com/2.png', postId: 'p2', type: 'image' },
        { path: 'https://cdn.example.com/3.png', postId: 'p3', type: 'image' },
      ],
    });

    render(<AiGeneratedMedia />);

    expect(screen.getByAltText('Generated media 1')).toBeInTheDocument();
    expect(screen.getByAltText('Generated media 2')).toBeInTheDocument();
    expect(screen.getByAltText('Generated media 3')).toBeInTheDocument();
  });

  it('pauses a video immediately when playback starts', () => {
    (useGeneratedMedia as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [{ path: 'https://cdn.example.com/1.mp4', postId: 'post-video', type: 'video' }],
    });

    render(<AiGeneratedMedia />);

    const videoElement = document.querySelector('video');
    if (!videoElement) throw new Error('Expected a video element');

    fireEvent.play(videoElement);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('renders an unknown placeholder for unsupported media types', () => {
    const unknownMedia = {
      path: 'https://cdn.example.com/unknown.bin',
      postId: 'post-unknown',
      type: 'audio',
    } as unknown as GeneratedMedia;

    (useGeneratedMedia as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [unknownMedia],
    });

    render(<AiGeneratedMedia />);
    expect(screen.getByText('Unknown media type')).toBeInTheDocument();
  });
});
