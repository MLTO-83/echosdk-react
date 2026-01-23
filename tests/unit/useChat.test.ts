import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../../src/hooks/useChat';

// Mock the API client
vi.mock('../../src/api/client', () => ({
    EchoSDKClient: vi.fn().mockImplementation(() => ({
        query: vi.fn().mockResolvedValue({
            message: {
                id: 'msg_2',
                text: 'AI response',
                sender: 'ai',
                timestamp: Date.now(),
            },
            conversationId: 'conv_1',
        }),
        requestHumanHandover: vi.fn().mockResolvedValue(undefined),
    })),
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useChat', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('initializes with empty messages', () => {
        const { result } = renderHook(() => useChat('test-app'));
        const [state] = result.current;

        expect(state.messages).toEqual([]);
        expect(state.isOpen).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('toggles chat open/closed', () => {
        const { result } = renderHook(() => useChat('test-app'));

        act(() => {
            const [, actions] = result.current;
            actions.toggleChat();
        });

        expect(result.current[0].isOpen).toBe(true);

        act(() => {
            const [, actions] = result.current;
            actions.toggleChat();
        });

        expect(result.current[0].isOpen).toBe(false);
    });

    it('sends message successfully', async () => {
        const { result } = renderHook(() => useChat('test-app'));

        await act(async () => {
            const [, actions] = result.current;
            await actions.sendMessage('Hello');
        });

        await waitFor(() => {
            const [state] = result.current;
            expect(state.messages.length).toBeGreaterThan(0);
        });
    });

    it('clears history', () => {
        const { result } = renderHook(() => useChat('test-app'));

        act(() => {
            const [, actions] = result.current;
            actions.clearHistory();
        });

        const [state] = result.current;
        expect(state.messages).toEqual([]);
        expect(state.conversationId).toBeNull();
    });
});
