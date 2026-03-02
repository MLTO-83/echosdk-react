/**
 * Covers the catch blocks inside useChat that are not reachable through the
 * validation-error path tested in useChat.test.ts, specifically:
 *   - sendMessage when the API call itself rejects
 *   - requestHumanHelp when the handover call rejects
 *   - requestHumanHelp early-return when there is no conversationId yet
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../../src/hooks/useChat';

// Controllable per-test mocks exposed at module scope so beforeEach can reset them
const mockQuery = vi.fn();
const mockHandover = vi.fn();

vi.mock('../../src/api/client', () => ({
    EchoSDKClient: vi.fn().mockImplementation(() => ({
        query: mockQuery,
        requestHumanHandover: mockHandover,
    })),
}));

// Minimal localStorage shim (jsdom resets between files but not between tests)
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useChat — error paths', () => {
    beforeEach(() => {
        localStorageMock.clear();
        mockQuery.mockReset();
        mockHandover.mockReset();
    });

    it('sets error and removes the optimistic message when the API rejects with an Error', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useChat('test-app'));

        await act(async () => {
            await result.current[1].sendMessage('Hello');
        });

        await waitFor(() => {
            const [state] = result.current;
            expect(state.error?.message).toBe('Network error');
            // The optimistic user message must be rolled back on failure
            expect(state.messages.filter((m) => m.sender === 'user')).toHaveLength(0);
        });
    });

    it('wraps a non-Error rejection from the API as a generic Error', async () => {
        // Some environments reject with a plain string or object
        mockQuery.mockRejectedValueOnce('plain string rejection');

        const { result } = renderHook(() => useChat('test-app'));

        await act(async () => {
            await result.current[1].sendMessage('Hello');
        });

        await waitFor(() => {
            const [state] = result.current;
            expect(state.error).toBeInstanceOf(Error);
            expect(state.error?.message).toBe('Unknown error');
        });
    });

    it('sets error when requestHumanHelp handover API call rejects', async () => {
        // First, establish a conversation via a successful query
        mockQuery.mockResolvedValueOnce({
            message: { id: 'msg_1', text: 'AI reply', sender: 'ai', timestamp: Date.now() },
            conversationId: 'conv_1',
        });

        const { result } = renderHook(() => useChat('test-app'));

        await act(async () => {
            await result.current[1].sendMessage('Hello');
        });

        await waitFor(() => expect(result.current[0].conversationId).toBe('conv_1'));

        mockHandover.mockRejectedValueOnce(new Error('Handover failed'));

        await act(async () => {
            await result.current[1].requestHumanHelp();
        });

        await waitFor(() => {
            expect(result.current[0].error?.message).toBe('Handover failed');
        });
    });

    it('does nothing when requestHumanHelp is called before any conversation is started', async () => {
        const { result } = renderHook(() => useChat('test-app'));

        // No sendMessage called → conversationId is null → early return
        await act(async () => {
            await result.current[1].requestHumanHelp();
        });

        expect(mockHandover).not.toHaveBeenCalled();
        expect(result.current[0].error).toBeNull();
    });
});
