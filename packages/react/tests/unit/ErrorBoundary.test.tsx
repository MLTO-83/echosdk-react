import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// A child that unconditionally throws to trigger the boundary
function BrokenChild(): never {
    throw new Error('Test render error');
}

function SafeChild() {
    return <div>Safe content</div>;
}

describe('ErrorBoundary', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders children normally when no error is thrown', () => {
        render(
            <ErrorBoundary>
                <SafeChild />
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe content')).toBeInTheDocument();
    });

    it('renders the fallback error UI when a child throws', () => {
        // React logs uncaught errors to console.error — suppress during this test
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        render(
            <ErrorBoundary>
                <BrokenChild />
            </ErrorBoundary>
        );

        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('calls the onError prop with the error and errorInfo when a child throws', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const onError = vi.fn();

        render(
            <ErrorBoundary onError={onError}>
                <BrokenChild />
            </ErrorBoundary>
        );

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Test render error' }),
            expect.objectContaining({ componentStack: expect.any(String) }),
        );
    });

    it('does not throw when onError prop is omitted', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        // Rendering a broken child without onError should not throw from the boundary itself
        expect(() =>
            render(
                <ErrorBoundary>
                    <BrokenChild />
                </ErrorBoundary>
            )
        ).not.toThrow();
    });
});
