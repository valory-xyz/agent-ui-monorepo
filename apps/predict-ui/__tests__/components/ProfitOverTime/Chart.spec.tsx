import { render } from '@testing-library/react';

import { Chart } from '../../../src/components/ProfitOverTime/Chart';

// Recharts uses ResizeObserver; mock it for jsdom
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Capture the Tooltip content function and axis tick formatters so we can invoke them in tests
type TooltipContentProps = {
  payload?: { value?: unknown }[];
  label?: string;
};
let capturedTooltipContent: ((props: TooltipContentProps) => React.ReactNode) | undefined;
let capturedXTickFormatter: ((value: unknown) => string) | undefined;
let capturedYTickFormatter: ((value: number) => string) | undefined;

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: ({ tickFormatter }: { tickFormatter?: (value: unknown) => string }) => {
    capturedXTickFormatter = tickFormatter;
    return null;
  },
  YAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => {
    capturedYTickFormatter = tickFormatter;
    return null;
  },
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
    capturedXTickFormatter = undefined;
    capturedYTickFormatter = undefined;
  });

  it('registers all chart callbacks after render', () => {
    render(<Chart data={mockData} />);
    expect(capturedTooltipContent).toBeDefined();
    expect(capturedXTickFormatter).toBeDefined();
    expect(capturedYTickFormatter).toBeDefined();
  });

  it('registers tooltip content with empty data array', () => {
    render(<Chart data={[]} />);
    expect(capturedTooltipContent).toBeDefined();
  });

  describe('ChartTooltip content', () => {
    beforeEach(() => {
      render(<Chart data={mockData} />);
    });

    const getTooltipContainer = (props: TooltipContentProps) => {
      if (!capturedTooltipContent) throw new Error('Tooltip content fn not captured');
      const { container } = render((<>{capturedTooltipContent(props)}</>) as React.ReactElement);
      return container;
    };

    it('shows "Profit of $X.XX" for positive value', () => {
      const container = getTooltipContainer({ payload: [{ value: 1.5 }], label: '2025-01-01' });
      expect(container.textContent).toContain('Profit of $1.50');
    });

    it('shows "Loss of $X.XX" for negative value', () => {
      const container = getTooltipContainer({ payload: [{ value: -0.3 }], label: '2025-01-02' });
      expect(container.textContent).toContain('Loss of $-0.30');
    });

    it('shows "No Profit or Loss" for zero value', () => {
      const container = getTooltipContainer({ payload: [{ value: 0 }], label: '2025-01-03' });
      expect(container.textContent).toContain('No Profit or Loss');
    });

    it('shows n/a for NaN value', () => {
      const container = getTooltipContainer({ payload: [{ value: NaN }], label: '2025-01-01' });
      expect(container.textContent).toContain('n/a');
    });

    it('shows n/a when payload is undefined', () => {
      const container = getTooltipContainer({ payload: undefined, label: '2025-01-01' });
      expect(container.textContent).toContain('n/a');
    });

    it('shows n/a when payload is empty', () => {
      const container = getTooltipContainer({ payload: [], label: '2025-01-01' });
      expect(container.textContent).toContain('n/a');
    });

    it('shows n/a when label is empty (no date)', () => {
      const container = getTooltipContainer({ payload: [{ value: 1.0 }], label: '' });
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

  describe('XAxis tickFormatter', () => {
    it('formats a Date timestamp as "Mon DD"', () => {
      render(<Chart data={mockData} />);
      if (!capturedXTickFormatter) throw new Error('XAxis tickFormatter not captured');
      const date = new Date('2024-01-15T00:00:00Z');
      const formatted = capturedXTickFormatter(date);
      // Intl.DateTimeFormat with month: 'short', day: '2-digit' → e.g. "Jan 15"
      expect(formatted).toMatch(/Jan/);
      expect(formatted).toMatch(/15/);
    });
  });

  describe('YAxis tickFormatter', () => {
    it('formats a positive value with currency symbol', () => {
      render(<Chart data={mockData} />);
      if (!capturedYTickFormatter) throw new Error('YAxis tickFormatter not captured');
      expect(capturedYTickFormatter(1.5)).toBe('$1.50');
    });

    it('formats zero value', () => {
      render(<Chart data={mockData} />);
      if (!capturedYTickFormatter) throw new Error('YAxis tickFormatter not captured');
      expect(capturedYTickFormatter(0)).toBe('$0.00');
    });

    it('formats a negative value', () => {
      render(<Chart data={mockData} />);
      if (!capturedYTickFormatter) throw new Error('YAxis tickFormatter not captured');
      expect(capturedYTickFormatter(-2.5)).toBe('$-2.50');
    });

    it('falls back to "$" for an unknown currency code', () => {
      render(
        <Chart
          data={mockData}
          currency={'XYZ' as unknown as import('../../../src/constants/currency').CurrencyCode}
        />,
      );
      if (!capturedYTickFormatter) throw new Error('YAxis tickFormatter not captured');
      expect(capturedYTickFormatter(1.0)).toBe('$1.00');
    });
  });
});
