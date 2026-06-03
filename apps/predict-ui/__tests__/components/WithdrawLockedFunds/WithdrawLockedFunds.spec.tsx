import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { WithdrawLockedFunds } from '../../../src/components/WithdrawLockedFunds';
import { useWithdrawLockedFunds } from '../../../src/hooks/useWithdrawLockedFunds';
import { WithdrawalFill, WithdrawalStatus } from '../../../src/types';

const fakeFill: WithdrawalFill = {
  token_id: '0xabc',
  shares_sold: 1,
  fill_price: 0.5,
  ts: 1715021978,
};

jest.mock('../../../src/hooks/useWithdrawLockedFunds');

const mockedHook = useWithdrawLockedFunds as jest.Mock;

const buildStatus = (
  overrides: Partial<WithdrawalStatus> = {},
): WithdrawalStatus => ({
  mode: 'idle',
  venue: 'polymarket',
  positions_total: 0,
  positions_sold: 0,
  positions_stuck: 0,
  fills: [],
  errors: [],
  ...overrides,
});

const renderCard = (
  props?: Partial<React.ComponentProps<typeof WithdrawLockedFunds>>,
) =>
  render(
    <WithdrawLockedFunds
      lockedAmount={120.32}
      marketName="Polymarket"
      {...(props ?? {})}
    />,
  );

describe('WithdrawLockedFunds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('header', () => {
    it('renders the title and the market-specific description', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus(),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(
        screen.getByText('Withdraw funds locked in markets'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Closes all open positions on Polymarket/),
      ).toBeInTheDocument();
    });

    it('uses the custom market name for cross-agent reuse', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus(),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ marketName: 'Omen' });
      expect(
        screen.getByText(/Closes all open positions on Omen/),
      ).toBeInTheDocument();
    });
  });

  describe('idle / initial state', () => {
    it('shows the locked amount and the initiate button when mode is idle', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'idle' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Open positions value')).toBeInTheDocument();
      expect(screen.getByText('~$120.32')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeEnabled();
    });

    it('disables the initiate button when there are no locked funds', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'idle' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ lockedAmount: 0 });
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeDisabled();
    });

    it('falls through to the initiate body when no status data has loaded yet', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: undefined,
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeInTheDocument();
    });

    it('calls initiateWithdraw when the button is clicked', () => {
      const initiateWithdraw = jest.fn().mockResolvedValue(undefined);
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus(),
        initiateWithdraw,
      });
      renderCard();
      fireEvent.click(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      );
      expect(initiateWithdraw).toHaveBeenCalledTimes(1);
    });

    it('swallows initiateWithdraw rejections so isError can drive the UI', async () => {
      const initiateWithdraw = jest.fn().mockRejectedValue(new Error('boom'));
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus(),
        initiateWithdraw,
      });
      renderCard();
      fireEvent.click(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      );
      await waitFor(() => expect(initiateWithdraw).toHaveBeenCalled());
    });
  });

  describe('in-progress state', () => {
    it('shows the armed-state message when the agent has been armed but not started', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'armed' }),
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      expect(
        screen.getByText(
          'Withdrawal requested. Waiting for the agent to complete its current actions...',
        ),
      ).toBeInTheDocument();
      expect(container.querySelector('.ant-spin')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /initiate withdrawal/i }),
      ).toBeNull();
    });

    it('shows the selling-state message when the sweep is in progress', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({
          mode: 'selling',
          positions_sold: 4,
          positions_total: 7,
        }),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(
        screen.getByText('Withdrawal initiated. Selling open positions...'),
      ).toBeInTheDocument();
    });
  });

  describe('complete state', () => {
    it('shows the success alert with the marketName-specific copy', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'complete' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdrawal complete!')).toBeInTheDocument();
      expect(
        screen.getByText(/Polymarket positions have been sold/),
      ).toBeInTheDocument();
      expect(screen.queryByText('Open positions value')).toBeNull();
    });

    it('returns to the initiate body when the success alert is dismissed', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'complete' }),
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      const closeButton = container.querySelector('.ant-alert-close-icon');
      if (!closeButton)
        throw new Error('Expected alert close button to be present');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Withdrawal complete!')).toBeNull();
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeInTheDocument();
    });
  });

  describe('errored state', () => {
    it('shows the failure alert above the initiate body when mode is errored with no fills', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored', positions_stuck: 2, fills: [] }),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdrawal failed')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeInTheDocument();
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
      fireEvent.click(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      );
      expect(initiateWithdraw).toHaveBeenCalledTimes(1);
    });

    it('falls back to the initiate body (not the spinner) after dismissing a failure', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored' }),
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      const closeButton = container.querySelector('.ant-alert-close-icon');
      if (!closeButton)
        throw new Error('Expected alert close button to be present');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Withdrawal failed')).toBeNull();
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeInTheDocument();
      expect(container.querySelector('.ant-spin')).toBeNull();
    });

    it('disables the retry button when there are no locked funds', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ lockedAmount: 0 });
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeDisabled();
    });
  });

  describe('partial withdrawal state', () => {
    it('shows the partial-withdrawal alert when mode=errored and at least one fill landed', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({
          mode: 'errored',
          positions_total: 3,
          positions_sold: 2,
          positions_stuck: 1,
          fills: [fakeFill, fakeFill],
        }),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(
        screen.getByText('Partial withdrawal completed'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Some positions couldn't be sold\. Please try again to withdraw the remaining funds\./,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText('Withdrawal failed')).toBeNull();
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeInTheDocument();
    });

    it('keeps showing the full-failure alert when mode=errored has no fills', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored', positions_stuck: 3, fills: [] }),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      expect(screen.getByText('Withdrawal failed')).toBeInTheDocument();
      expect(screen.queryByText('Partial withdrawal completed')).toBeNull();
    });

    it('falls back to the initiate body after dismissing the partial alert', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored', fills: [fakeFill] }),
        initiateWithdraw: jest.fn(),
      });
      const { container } = renderCard();
      const closeButton = container.querySelector('.ant-alert-close-icon');
      if (!closeButton)
        throw new Error('Expected alert close button to be present');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Partial withdrawal completed')).toBeNull();
      expect(screen.getByText('Open positions value')).toBeInTheDocument();
    });

    it('retries via the initiate button from the partial state', () => {
      const initiateWithdraw = jest.fn().mockResolvedValue(undefined);
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored', fills: [fakeFill] }),
        initiateWithdraw,
      });
      renderCard();
      fireEvent.click(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      );
      expect(initiateWithdraw).toHaveBeenCalledTimes(1);
    });

    it('disables the retry button on the partial state when there are no locked funds', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored', fills: [fakeFill] }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ lockedAmount: 0 });
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeDisabled();
    });
  });

  describe('metrics unavailable (Polystrat no-metrics state)', () => {
    it('uses the alternate description and hides the open-positions value', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'idle' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ metricsAvailable: false });
      expect(
        screen.getByText(/Sell all existing positions on Polymarket/),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Closes all open positions/)).toBeNull();
      expect(screen.queryByText('Open positions value')).toBeNull();
    });

    it('keeps the initiate button enabled even when the locked amount is zero', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'idle' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ metricsAvailable: false, lockedAmount: 0 });
      expect(
        screen.getByRole('button', { name: /initiate withdrawal/i }),
      ).toBeEnabled();
    });

    it('hides the open-positions value while selling', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'selling' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ metricsAvailable: false });
      expect(
        screen.getByText('Withdrawal initiated. Selling open positions...'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Open positions value')).toBeNull();
    });

    it('hides the open-positions value in the partial-withdrawal state', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored', fills: [fakeFill] }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ metricsAvailable: false });
      expect(
        screen.getByText('Partial withdrawal completed'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Open positions value')).toBeNull();
    });

    it('hides the open-positions value in the errored state', () => {
      mockedHook.mockReturnValue({
        isLoading: false,
        isError: false,
        data: buildStatus({ mode: 'errored', fills: [] }),
        initiateWithdraw: jest.fn(),
      });
      renderCard({ metricsAvailable: false });
      expect(screen.getByText('Withdrawal failed')).toBeInTheDocument();
      expect(screen.queryByText('Open positions value')).toBeNull();
    });
  });

  describe('loading state propagation', () => {
    it('shows the initiate button in loading state while the hook reports loading', () => {
      mockedHook.mockReturnValue({
        isLoading: true,
        isError: false,
        data: buildStatus({ mode: 'idle' }),
        initiateWithdraw: jest.fn(),
      });
      renderCard();
      const button = screen.getByRole('button', {
        name: /initiate withdrawal/i,
      });
      expect(button).toHaveClass('ant-btn-loading');
    });
  });
});
