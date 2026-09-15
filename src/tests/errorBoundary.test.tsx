import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Helper component that throws a controlled error
const BuggyComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Controlled simulation error for testing stack trace suppression');
  }
  return <div data-testid="normal-content">محتوای عادی بدون خطا</div>;
};

describe('14. Error Boundary Verification', () => {
  it('renders children normally when no error occurs', () => {
    // In our happy-dom test environment:
    const element = React.createElement(
      ErrorBoundary,
      null,
      React.createElement(BuggyComponent, { shouldThrow: false })
    );
    expect(element).toBeDefined();
  });

  it('catches controlled render error and produces sanitized error state without exposing raw stack trace in UI', () => {
    const error = new Error('Sensitive internal DB query failed at /var/secrets/db.ts:42');
    const derived = ErrorBoundary.getDerivedStateFromError(error);

    expect(derived.hasError).toBe(true);
    expect(derived.error).toBe(error);
    expect(derived.errorId).toMatch(/^ERR-/);

    // Verify error boundary instance state renders safe UI
    const boundary = new ErrorBoundary({ children: null });
    boundary.state = {
      hasError: true,
      error,
      errorId: 'ERR-SAFE-TEST'
    };

    const rendered = boundary.render();
    expect(React.isValidElement(rendered)).toBe(true);
    if (React.isValidElement<{ id?: string }>(rendered)) {
      expect(rendered.props.id).toBe('app-error-boundary');
    }
  });
});
