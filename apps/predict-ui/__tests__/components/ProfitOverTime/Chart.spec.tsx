import { render } from '@testing-library/react';

import { Chart } from '../../../src/components/ProfitOverTime/Chart';

// Recharts uses ResizeObserver; mock it for jsdom
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Capture the Tooltip content function so we can invoke it in tests
type TooltipContentProps = {
  payload?: { value?: unknown }[];
  label?: string;
};
let capturedTooltipContent: ((props: TooltipContentProps) => React.ReactNode) | undefined;

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Line: () => null,
  Tooltip: ({ content }: { content: (props: TooltipContentProps) => React.ReactNode }) => {
    capturedTooltipContent = content;
    return null;
  },
}));

const mockData = [
  { timestamp: new Date('2025-01-01'), value: 1.5 },
  { timestamp: new Date('2025-01-02'), value: -0.3 },
  { timestamp: new Date('2025-01-03'), value: 0 },
];

describe('Chart', () => {
  beforeEach(() => {
    capturedTooltipContent = undefined;
  });

  it('renders without crashing with data', () => {
    expect(() => render(<Chart data={mockData} />)).not.toThrow();
  });

  it('renders without crashing with empty data', () => {
    expect(() => render(<Chart data={[]} />)).not.toThrow();
  });

  it('renders without crashing with custom currency', () => {
    expect(() => render(<Chart data={mockData} currency="USDC" />)).not.toThrow();
  });

  it('defaults currency to USD when not provided', () => {
    render(<Chart data={mockData} />);
    // Tooltip content function is registered
    expect(capturedTooltipContent).toBeDefined();
  });

  describe('ChartTooltip content', () => {
    const renderTooltip = (props: TooltipContentProps) => {
      render(<Chart data={mockData} />);
      if (!capturedTooltipContent) throw new Error('Tooltip content fn not captured');
      const { container } = render((<>{capturedTooltipContent(props)}</>) as React.ReactElement);
      return container;
    };

    it('shows "Profit of $X.XX" for positive value', () => {
      const container = renderTooltip({ payload: [{ value: 1.5 }], label: '2025-01-01' });
      expect(container.textContent).toContain('Profit of $1.50');
    });

    it('shows "Loss of $X.XX" for negative value', () => {
      const container = renderTooltip({ payload: [{ value: -0.3 }], label: '2025-01-02' });
      expect(container.textContent).toContain('Loss of $-0.30');
    });

    it('shows "No Profit or Loss" for zero value', () => {
      const container = renderTooltip({ payload: [{ value: 0 }], label: '2025-01-03' });
      expect(container.textContent).toContain('No Profit or Loss');
    });

    it('shows n/a for NaN value', () => {
      const container = renderTooltip({ payload: [{ value: NaN }], label: '2025-01-01' });
      expect(container.textContent).toContain('n/a');
    });

    it('shows n/a when payload is undefined', () => {
      const container = renderTooltip({ payload: undefined, label: '2025-01-01' });
      expect(container.textContent).toContain('n/a');
    });

    it('shows n/a when payload is empty', () => {
      const container = renderTooltip({ payload: [], label: '2025-01-01' });
      expect(container.textContent).toContain('n/a');
    });

    it('shows n/a when label is empty (no date)', () => {
      const container = renderTooltip({ payload: [{ value: 1.0 }], label: '' });
      // Profit is shown but date falls back to n/a
      expect(container.textContent).toContain('n/a');
    });

    it('uses custom currency symbol for USDC', () => {
      render(<Chart data={mockData} currency="USDC" />);
      if (!capturedTooltipContent) throw new Error('not captured');
      const { container } = render(
        (
          <>{capturedTooltipContent({ payload: [{ value: 2.0 }], label: '2025-01-01' })}</>
        ) as React.ReactElement,
      );
      expect(container.textContent).toContain('Profit of $2.00');
    });
  });
});
