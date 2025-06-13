import { Alert, Flex } from 'antd';
import React, { Component, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  message?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

// TODO: move to libs?
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error(this.state.errorMessage);
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { message, children } = this.props;

    if (hasError) {
      return (
        <Flex vertical align="center" justify="center" style={{ padding: '2rem', width: '100%' }}>
          <Alert message={message || 'Something went wrong.'} type="error" showIcon />
        </Flex>
      );
    }

    return children;
  }
}
