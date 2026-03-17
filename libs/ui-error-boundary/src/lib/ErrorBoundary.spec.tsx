import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from './ErrorBoundary';

const Throw = ({ message = 'boom' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <span>healthy child</span>
      </ErrorBoundary>,
    );
    expect(screen.getByText('healthy child')).toBeTruthy();
  });

  it('shows the default error message when a child throws', () => {
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong.')).toBeTruthy();
  });

  it('shows a custom message prop when provided', () => {
    render(
      <ErrorBoundary message="Custom error message">
        <Throw />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom error message')).toBeTruthy();
  });

  it('hides children after an error', () => {
    render(
      <ErrorBoundary>
        <Throw />
        <span>should be hidden</span>
      </ErrorBoundary>,
    );
    expect(screen.queryByText('should be hidden')).toBeNull();
  });

  it('calls console.error when a child throws', () => {
    render(
      <ErrorBoundary>
        <Throw message="test error" />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalled();
  });

  it('getDerivedStateFromError returns hasError: true with the error message', () => {
    const error = new Error('derived error');
    const state = ErrorBoundary.getDerivedStateFromError(error);
    expect(state).toEqual({ hasError: true, errorMessage: 'derived error' });
  });

  it('recovers when the thrown child is replaced with a healthy one', () => {
    const { rerender } = render(
      <ErrorBoundary key="a">
        <Throw />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong.')).toBeTruthy();

    rerender(
      <ErrorBoundary key="b">
        <span>recovered</span>
      </ErrorBoundary>,
    );
    expect(screen.getByText('recovered')).toBeTruthy();
  });
});
