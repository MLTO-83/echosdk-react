import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { saveConversation, loadConversation, clearConversation } from '../../src/utils/storage';
import type { StoredConversation } from '../../src/utils/storage';

const STORAGE_KEY = 'echosdk_conversation';

describe('Storage Utils', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('saveConversation persists data and loadConversation retrieves it', () => {
        const data: StoredConversation = {
            conversationId: 'conv_123',
            messages: [{ id: 'm1', text: 'hi', sender: 'user', timestamp: 1 }],
            lastUpdated: Date.now(),
        };

        saveConversation(data);
        const loaded = loadConversation();

        expect(loaded).toEqual(data);
    });

    it('loadConversation returns null when nothing is stored', () => {
        expect(loadConversation()).toBeNull();
    });

    it('clearConversation removes the stored conversation', () => {
        saveConversation({ conversationId: 'c1', messages: [], lastUpdated: 0 });
        clearConversation();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});

describe('Storage Utils Error Handling', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should warn on saveConversation error', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('fail'); });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        saveConversation({ conversationId: 'id', messages: [], lastUpdated: Date.now() });

        expect(warnSpy).toHaveBeenCalledWith(
            'Failed to save conversation to localStorage:', expect.any(Error)
        );
    });

    it('should warn on loadConversation error', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('fail'); });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        loadConversation();

        expect(warnSpy).toHaveBeenCalledWith(
            'Failed to load conversation from localStorage:', expect.any(Error)
        );
    });

    it('should warn on clearConversation error', () => {
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('fail'); });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        clearConversation();

        expect(warnSpy).toHaveBeenCalledWith(
            'Failed to clear conversation from localStorage:', expect.any(Error)
        );
    });
});
