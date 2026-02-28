import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { trackEvent } from '../../src/utils/analytics';

describe('Analytics Utils', () => {
    beforeEach(() => {
        localStorage.setItem('echosdk_debug', 'true');
    });

    afterEach(() => {
        localStorage.removeItem('echosdk_debug');
        vi.restoreAllMocks();
    });

    it('logs event to console in debug mode', () => {
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });

        trackEvent('chat_opened');

        expect(debugSpy).toHaveBeenCalledWith('[EchoSDK]', 'Analytics: chat_opened', undefined);
    });

    it('logs event with data in debug mode', () => {
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
        const data = { foo: 'bar' };

        trackEvent('message_sent', data);

        expect(debugSpy).toHaveBeenCalledWith('[EchoSDK]', 'Analytics: message_sent', data);
    });
});
