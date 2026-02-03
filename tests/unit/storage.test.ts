import { describe, it, expect, vi, afterEach } from 'vitest';
import { saveConversation, loadConversation, clearConversation, StoredConversation } from '../../src/utils/storage';

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
