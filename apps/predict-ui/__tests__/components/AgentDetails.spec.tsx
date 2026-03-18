import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { render, screen } from '@testing-library/react';

import { AgentDetails } from '../../src/components/AgentDetails';

describe('AgentDetails', () => {
  it('renders "Created:" label', () => {
    render(<AgentDetails />);
    expect(screen.getByText('Created:')).toBeInTheDocument();
  });

  it('renders "Last active:" label', () => {
    render(<AgentDetails />);
    expect(screen.getByText('Last active:')).toBeInTheDocument();
  });

  it('shows NA when createdAt is not provided', () => {
    render(<AgentDetails />);
    // NA appears multiple times (one for each missing field)
    const naElements = screen.getAllByText(NA);
    expect(naElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a relative time string when createdAt ISO is provided', () => {
    // Use a date well in the past so getTimeAgo returns a non-zero value
    render(<AgentDetails createdAt="2020-01-01T00:00:00Z" />);
    // Should contain "ago" since it's years in the past
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('ago');
  });

  it('renders a relative time string when lastActiveAt ISO is provided', () => {
    render(<AgentDetails lastActiveAt="2020-06-01T00:00:00Z" />);
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('ago');
  });

  it('shows NA for both fields when neither prop is provided', () => {
    render(<AgentDetails />);
    const naElements = screen.getAllByText(NA);
    expect(naElements.length).toBe(2);
  });
});
