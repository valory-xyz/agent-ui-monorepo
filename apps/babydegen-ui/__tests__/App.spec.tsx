import { render, screen } from '@testing-library/react';

import App from '../src/App';

// Mock all heavy components to prevent deep dependency chains
jest.mock('../src/components/Portfolio/Portfolio', () => ({
  Portfolio: () => <div>Portfolio</div>,
}));

jest.mock('../src/components/Allocation/Allocation', () => ({
  Allocation: () => <div>Allocation</div>,
}));

jest.mock('../src/components/Strategy/Strategy', () => ({
  Strategy: () => <div>Strategy</div>,
}));

jest.mock('../src/components/WithdrawAgentsFunds/WithdrawAgentsFunds', () => ({
  WithdrawAgentsFunds: () => <div>WithdrawAgentsFunds</div>,
}));

jest.mock('@agent-ui-monorepo/ui-theme', () => ({
  GlobalStyles: () => null,
}));

describe('App (babydegen-ui)', () => {
  it('renders every section, with Strategy shown without a chat gate', () => {
    render(<App />);
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Allocation')).toBeInTheDocument();
    expect(screen.getByText('Strategy')).toBeInTheDocument();
    expect(screen.getByText('WithdrawAgentsFunds')).toBeInTheDocument();
  });

  it("does not render the chat (Update agent's goal) section", () => {
    render(<App />);
    expect(screen.queryByText("Update agent's goal")).toBeNull();
  });
});
