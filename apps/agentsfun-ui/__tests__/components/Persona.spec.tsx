import { fireEvent, render, screen } from '@testing-library/react';

import { Persona } from '../../src/components/Persona';
import { useAgentDetails } from '../../src/hooks/useAgentDetails';
import { mockAgentInfo } from '../../src/mocks';

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');

  return {
    ...actual,
    Typography: {
      ...actual.Typography,
      Paragraph: ({
        children,
        ellipsis,
        className,
      }: {
        children: React.ReactNode;
        ellipsis?: { symbol?: (expanded: boolean) => React.ReactNode };
        className?: string;
      }) => (
        <div className={className}>
          <div>{children}</div>
          {ellipsis?.symbol ? (
            <>
              <div>{ellipsis.symbol(false)}</div>
              <div>{ellipsis.symbol(true)}</div>
            </>
          ) : null}
        </div>
      ),
    },
  };
});

jest.mock('../../src/hooks/useAgentDetails');

describe('Persona (agentsfun-ui)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a loading skeleton while agent details are loading', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    const { container } = render(<Persona />);
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('renders the loading skeleton when the query returns no data yet', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: null,
    });

    const { container } = render(<Persona />);
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('renders an error state when the query fails', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    });

    render(<Persona />);
    expect(screen.getByText('Failed to load agent details.')).toBeInTheDocument();
  });

  it('renders the name, username, and persona description', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockAgentInfo,
    });

    render(<Persona />);

    expect(screen.getByText(mockAgentInfo.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `@${mockAgentInfo.username}` })).toBeInTheDocument();
    expect(screen.getByText('Persona')).toBeInTheDocument();
    expect(screen.getByText(/CycleSeerBot is a quirky/)).toBeInTheDocument();
    expect(screen.getByText('Show full description')).toBeInTheDocument();
    expect(screen.getByText('Hide full description')).toBeInTheDocument();
  });

  it('opens the agent profile on X when the username is clicked', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockAgentInfo,
    });

    render(<Persona />);
    fireEvent.click(screen.getByRole('button', { name: `@${mockAgentInfo.username}` }));

    expect(window.open).toHaveBeenCalledWith(`https://x.com/${mockAgentInfo.username}`, '_blank');
  });

  it('renders safely when the persona description is empty', () => {
    (useAgentDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...mockAgentInfo, personaDescription: '' },
    });

    render(<Persona />);
    expect(screen.getByText('Persona')).toBeInTheDocument();
  });
});
