import {
  mockFunds,
  mockWithdrawInitiateResponse,
  mockWithdrawStatusResponse,
} from '../../src/mocks/mockFundsWithdrawal';
import { mockPortfolio } from '../../src/mocks/mockPortfolio';

describe('babydegen-ui mock data', () => {
  it('matches the expected structural shape', () => {
    expect(mockFunds.asset_breakdown.length).toBeGreaterThan(0);
    expect(mockWithdrawInitiateResponse.target_address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(mockWithdrawStatusResponse.safe_address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(mockPortfolio.allocations.length).toBeGreaterThan(0);
    expect(mockPortfolio.selected_protocols.length).toBeGreaterThan(0);
  });
});
