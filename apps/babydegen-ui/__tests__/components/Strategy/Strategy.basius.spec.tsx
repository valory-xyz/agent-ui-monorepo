import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createElement } from 'react';

jest.mock('../../../src/hooks/usePortfolio');

// agentMap.ts reads process.env at module load time, so the component (and
// agentMap behind it) is required only after the env is set to basius.
process.env.REACT_APP_AGENT_NAME = 'basius';
const { Strategy } = require('../../../src/components/Strategy/Strategy');

const { usePortfolio } = jest.requireMock('../../../src/hooks/usePortfolio') as {
  usePortfolio: jest.Mock;
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Strategy (basius)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('renders one avatar per normalised protocol without duplicate keys', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    usePortfolio.mockReturnValue({
      data: { trading_type: 'balanced', selected_protocols: ['velodrome', 'aerodrome', 'aero'] },
      isLoading: false,
    });
    const { container } = render(<Strategy />, { wrapper: createWrapper() });
    const logos = Array.from(container.querySelectorAll('.ant-avatar img')).map((img) =>
      img.getAttribute('src'),
    );
    expect(logos).toEqual(['/logos/protocols/aerodrome.png', '/logos/protocols/aero.png']);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
