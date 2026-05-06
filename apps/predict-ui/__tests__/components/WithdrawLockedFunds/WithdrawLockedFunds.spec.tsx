import { fireEvent, render, screen } from '@testing-library/react';

import { WithdrawLockedFunds } from '../../../src/components/WithdrawLockedFunds';
import { useWithdrawLockedFunds } from '../../../src/hooks/useWithdrawLockedFunds';

jest.mock('../../../src/hooks/useWithdrawLockedFunds');

const mockedHook = useWithdrawLockedFunds as jest.Mock;

const renderCard = (props?: Partial<React.ComponentProps<typeof WithdrawLockedFunds>>) =>
  render(<WithdrawLockedFunds lockedAmount={120.32} marketName="Polymarket" {...(props ?? {})} />);

describe('WithdrawLockedFunds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('header', () => {
    it('renders the title and the market-specific description', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: undefined,
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdraw funds locked in markets')).toBeInTheDocument();
      expect(screen.getByText(/Closes all open positions on Polymarket/)).toBeInTheDocument();
    });

    it('uses the custom market name for cross-agent reuse', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: undefined,
        initiateWithdraw: jest.fn(),
      });
      renderCard({ marketName: 'Omen' });
      expect(screen.getByText(/Closes all open positions on Omen/)).toBeInTheDocument();
    });
  });

  describe('initial state', () => {
    it('shows the locked amount and the initiate button', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: undefined,
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Open positions value')).toBeInTheDocument();
      expect(screen.getByText('~$120.32')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /initiate withdrawal/i })).toBeEnabled();
    });

    it('calls initiateWithdraw when the button is clicked', () => {
      const initiateWithdraw = jest.fn().mockResolvedValue(undefined);
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: undefined,
        initiateWithdraw,
      });
      renderCard();
      fireEvent.click(screen.getByRole('button', { name: /initiate withdrawal/i }));
      expect(initiateWithdraw).toHaveBeenCalledTimes(1);
    });

    it('swallows initiateWithdraw rejections so isError can drive the UI', async () => {
      const initiateWithdraw = jest.fn().mockRejectedValue(new Error('boom'));
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: undefined,
        initiateWithdraw,
      });
      renderCard();
      fireEvent.click(screen.getByRole('button', { name: /initiate withdrawal/i }));
      await Promise.resolve();
      await Promise.resolve();
      expect(initiateWithdraw).toHaveBeenCalled();
    });
  });

  describe('in-progress state', () => {
    it('renders the message coming from the backend with a spinner', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: {
          status: 'withdrawing',
          message: 'Withdrawal initiated. Selling open positions...',
          transaction_link: null,
        },
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      expect(
        screen.getByText('Withdrawal initiated. Selling open positions...'),
      ).toBeInTheDocument();
      expect(container.querySelector('.ant-spin')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /initiate withdrawal/i })).toBeNull();
    });

    it('renders an empty message string without crashing when the backend omits one', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: {
          status: 'initiated',
          message: undefined,
          transaction_link: null,
        },
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    });
  });

  describe('done state', () => {
    it('shows the success alert with transaction link', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: {
          status: 'completed',
          message: 'done',
          transaction_link: 'https://example.com/tx',
        },
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdrawal complete!')).toBeInTheDocument();
      const link = screen.getByRole('link', { name: /view transaction details/i });
      expect(link).toHaveAttribute('href', 'https://example.com/tx');
      expect(screen.queryByText('Open positions value')).toBeNull();
    });

    it('omits the transaction link when none is returned', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'completed', message: 'done', transaction_link: null },
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdrawal complete!')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /view transaction details/i })).toBeNull();
    });

    it('returns to the initial state when the success alert is dismissed', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'completed', message: 'done', transaction_link: null },
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      const closeButton = container.querySelector('.ant-alert-close-icon');
      if (!closeButton) throw new Error('Expected alert close button to be present');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Withdrawal complete!')).toBeNull();
      expect(screen.getByRole('button', { name: /initiate withdrawal/i })).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows the failure alert above the initial state for retry', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: {
          status: 'failed',
          message: 'failed',
          transaction_link: 'https://example.com/tx-fail',
        },
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdrawal failed')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /last transaction details/i })).toHaveAttribute(
        'href',
        'https://example.com/tx-fail',
      );
      expect(screen.getByRole('button', { name: /initiate withdrawal/i })).toBeInTheDocument();
    });

    it('shows the failure alert when isError is true even without status data', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: true,
        data: undefined,
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdrawal failed')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /last transaction details/i })).toBeNull();
    });

    it('retries via the initiate button after a failure', () => {
      const initiateWithdraw = jest.fn().mockResolvedValue(undefined);
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: true,
        data: undefined,
        initiateWithdraw,
      });
      renderCard();
      fireEvent.click(screen.getByRole('button', { name: /initiate withdrawal/i }));
      expect(initiateWithdraw).toHaveBeenCalledTimes(1);
    });

    it('hides the failure alert when dismissed and shows the initial state', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'failed', message: 'oops', transaction_link: null },
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      const closeButton = container.querySelector('.ant-alert-close-icon');
      if (!closeButton) throw new Error('Expected alert close button to be present');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Withdrawal failed')).toBeNull();
      expect(screen.getByText('Open positions value')).toBeInTheDocument();
    });

    it('falls back to the initiate button (not the in-progress spinner) after dismissing a failure', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'failed', message: 'oops', transaction_link: null },
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      const closeButton = container.querySelector('.ant-alert-close-icon');
      if (!closeButton) throw new Error('Expected alert close button to be present');
      fireEvent.click(closeButton);

      expect(screen.getByRole('button', { name: /initiate withdrawal/i })).toBeInTheDocument();
      expect(container.querySelector('.ant-spin')).toBeNull();
    });
  });

  describe('loading state propagation', () => {
    it('disables the initiate button while the hook reports loading', () => {
      mockedHook.mockReturnValue({
        isLoading: true,
        isError: false,
        data: undefined,
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      const button = screen.getByRole('button', { name: /initiate withdrawal/i });
      expect(button).toHaveClass('ant-btn-loading');
    });
  });
});
