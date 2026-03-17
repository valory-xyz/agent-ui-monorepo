import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App as AntdApp } from 'antd';
import { createElement } from 'react';

import { WithdrawInvestedFunds } from '../../../src/components/WithdrawAgentsFunds/WithdrawInvestedFunds';

jest.mock('../../../src/components/WithdrawAgentsFunds/useFunds');
jest.mock('../../../src/components/WithdrawAgentsFunds/useWithdrawFunds');
// viem uses TextEncoder which is unavailable in jsdom; mock only isAddress
jest.mock('viem', () => ({
  isAddress: (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr),
}));

const { useFunds } = jest.requireMock('../../../src/components/WithdrawAgentsFunds/useFunds') as {
  useFunds: jest.Mock;
};
const { useWithdrawFunds } = jest.requireMock(
  '../../../src/components/WithdrawAgentsFunds/useWithdrawFunds',
) as {
  useWithdrawFunds: jest.Mock;
};

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(AntdApp, null, children);

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';

describe('WithdrawInvestedFunds', () => {
  const mockInitiate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useFunds.mockReturnValue({ isLoading: false, data: { total_value_usd: 1000 } });
    useWithdrawFunds.mockReturnValue({
      isLoading: false,
      isError: false,
      data: undefined,
      initiateWithdraw: mockInitiate,
    });
  });

  describe('default state (InitiateWithdrawal)', () => {
    it('renders "Funds to withdraw" label and initiate button', () => {
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('Funds to withdraw')).toBeTruthy();
      expect(screen.getByText('Initiate withdrawal')).toBeTruthy();
    });

    it('shows formatted funds amount when data is available', () => {
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('$1000.00 USDC')).toBeTruthy();
    });

    it('shows n/a when funds data is null', () => {
      useFunds.mockReturnValue({ isLoading: false, data: null });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('n/a')).toBeTruthy();
    });

    it('shows skeleton when funds is loading', () => {
      useFunds.mockReturnValue({ isLoading: true, data: null });
      const { container } = render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(container.querySelector('.ant-skeleton')).toBeTruthy();
    });

    it('initiate button is disabled when address field is empty', () => {
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      const button = screen.getByRole('button', { name: /Initiate withdrawal/ });
      expect(button).toHaveProperty('disabled', true);
    });

    it('initiate button is enabled after address is typed', () => {
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      fireEvent.change(screen.getByPlaceholderText('0x...'), {
        target: { value: VALID_ADDRESS },
      });
      const button = screen.getByRole('button', { name: /Initiate withdrawal/ });
      expect(button).toHaveProperty('disabled', false);
    });

    it('calls initiateWithdraw with the typed address', async () => {
      mockInitiate.mockResolvedValue(undefined);
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      fireEvent.change(screen.getByPlaceholderText('0x...'), {
        target: { value: VALID_ADDRESS },
      });
      fireEvent.click(screen.getByRole('button', { name: /Initiate withdrawal/ }));
      await waitFor(() => expect(mockInitiate).toHaveBeenCalledWith(VALID_ADDRESS));
    });

    it('does not call initiateWithdraw for an invalid (non-EVM) address', async () => {
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      fireEvent.change(screen.getByPlaceholderText('0x...'), {
        target: { value: 'not-a-valid-address' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Initiate withdrawal/ }));
      await waitFor(() => expect(mockInitiate).not.toHaveBeenCalled());
    });
  });

  describe('error / failed state', () => {
    it('shows WithdrawFailed when isError=true', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: true,
        data: undefined,
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('Withdrawal failed due to error!')).toBeTruthy();
    });

    it('shows WithdrawFailed when status=failed', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'failed', transaction_link: null },
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('Withdrawal failed due to error!')).toBeTruthy();
    });

    it('shows transaction link in failed state when available', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'failed', transaction_link: 'https://example.com/tx/123' },
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText(/Transaction details/)).toBeTruthy();
    });
  });

  describe('success state', () => {
    it('shows "Withdrawal complete!" when status=completed', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'completed', transaction_link: null },
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('Withdrawal complete!')).toBeTruthy();
    });

    it('shows transaction link in success state when available', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'completed', transaction_link: 'https://example.com/tx/456' },
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText(/Transaction details/)).toBeTruthy();
    });
  });

  describe('in-progress states', () => {
    it('shows loading message when status=initiated', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'initiated', message: 'Initiating withdrawal...' },
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('Initiating withdrawal...')).toBeTruthy();
    });

    it('shows loading message when status=withdrawing', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'withdrawing', message: 'Withdrawal in progress...' },
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('Withdrawal in progress...')).toBeTruthy();
    });

    it('still renders FundsToWithdraw alongside loading state', () => {
      useWithdrawFunds.mockReturnValue({
        isLoading: false,
        isError: false,
        data: { status: 'initiated', message: 'Initiating...' },
        initiateWithdraw: mockInitiate,
      });
      render(<WithdrawInvestedFunds />, { wrapper: Wrapper });
      expect(screen.getByText('Funds to withdraw')).toBeTruthy();
    });
  });
});
