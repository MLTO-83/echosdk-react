import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTheme } from '../../src/hooks/useTheme';

describe('useTheme', () => {
    let matchMediaMock: any;

    beforeEach(() => {
        // Reset DOM
        document.documentElement.removeAttribute('data-echo-theme');

        // Mock matchMedia
        matchMediaMock = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
        window.matchMedia = matchMediaMock;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('sets theme to light when specified', () => {
        renderHook(() => useTheme('light'));
        expect(document.documentElement.getAttribute('data-echo-theme')).toBe('light');
    });

    it('sets theme to dark when specified', () => {
        renderHook(() => useTheme('dark'));
        expect(document.documentElement.getAttribute('data-echo-theme')).toBe('dark');
    });

    it('sets auto theme based on system preference (dark)', () => {
        matchMediaMock.mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        renderHook(() => useTheme('auto'));
        expect(document.documentElement.getAttribute('data-echo-theme')).toBe('dark');
    });

    it('sets auto theme based on system preference (light)', () => {
        matchMediaMock.mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        renderHook(() => useTheme('auto'));
        expect(document.documentElement.getAttribute('data-echo-theme')).toBe('light');
    });

    it('updates auto theme when system preference changes', () => {
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        let changeCallback: any;

        matchMediaMock.mockReturnValue({
            matches: false, // initially light
            addEventListener: (event: string, cb: any) => {
                if (event === 'change') changeCallback = cb;
            },
            removeEventListener,
        });

        renderHook(() => useTheme('auto'));
        expect(document.documentElement.getAttribute('data-echo-theme')).toBe('light');

        // Simulate change
        if (changeCallback) {
            changeCallback({ matches: true } as MediaQueryListEvent);
        }
        expect(document.documentElement.getAttribute('data-echo-theme')).toBe('dark');
    });
});
