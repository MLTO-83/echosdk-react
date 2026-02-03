import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackEvent } from '../../src/utils/analytics';

describe('Analytics Utils', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('logs event to console', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        trackEvent('chat_opened');

        expect(logSpy).toHaveBeenCalledWith('[EchoSDK Analytics] chat_opened', undefined);
    });

    it('logs event with data', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        const data = { foo: 'bar' };

        trackEvent('message_sent', data);

        expect(logSpy).toHaveBeenCalledWith('[EchoSDK Analytics] message_sent', data);
    });
});
