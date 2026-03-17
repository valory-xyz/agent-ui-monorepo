import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from '../../src/components/ErrorBoundary';

const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error message');
  return <div>children rendered</div>;
};

describe('ErrorBoundary (babydegen-ui)', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => undefined));
  afterEach(() => jest.restoreAllMocks());

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('child content')).toBeTruthy();
  });

  it('renders default error message when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong.')).toBeTruthy();
  });

  it('renders custom message when provided and child throws', () => {
    render(
      <ErrorBoundary message="Custom error occurred">
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom error occurred')).toBeTruthy();
  });

  it('hides children when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.queryByText('children rendered')).toBeNull();
  });

  it('getDerivedStateFromError returns hasError=true', () => {
    const error = new Error('derived error');
    const state = ErrorBoundary.getDerivedStateFromError(error);
    expect(state.hasError).toBe(true);
    expect(state.errorMessage).toBe('derived error');
  });

  it('calls console.error when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalled();
  });
});
