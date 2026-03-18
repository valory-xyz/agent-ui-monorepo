import { fireEvent, render, screen } from '@testing-library/react';

import { WithdrawAgentsFunds } from '../../../src/components/WithdrawAgentsFunds/WithdrawAgentsFunds';

// WithdrawInvestedFunds needs hooks — mock it
jest.mock('../../../src/components/WithdrawAgentsFunds/WithdrawInvestedFunds', () => ({
  WithdrawInvestedFunds: () => <div>WithdrawInvestedFunds</div>,
}));

describe('WithdrawAgentsFunds', () => {
  it('renders "Withdraw agents funds" title initially', () => {
    render(<WithdrawAgentsFunds />);
    expect(screen.getByText('Withdraw agents funds')).toBeInTheDocument();
  });

  it('renders Withdraw button initially', () => {
    render(<WithdrawAgentsFunds />);
    expect(screen.getByText('Withdraw')).toBeInTheDocument();
  });

  it('shows WithdrawInvestedFunds after clicking Withdraw', () => {
    render(<WithdrawAgentsFunds />);
    fireEvent.click(screen.getByText('Withdraw'));
    expect(screen.getByText('WithdrawInvestedFunds')).toBeInTheDocument();
  });

  it('changes title to "Withdraw invested funds" after clicking Withdraw', () => {
    render(<WithdrawAgentsFunds />);
    fireEvent.click(screen.getByText('Withdraw'));
    expect(screen.getByText('Withdraw invested funds')).toBeInTheDocument();
  });
});
