import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EchoSDKClient } from '../../src/api/client';

describe('EchoSDKClient', () => {
    // Mock fetch globally
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    beforeEach(() => {
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('uses default API URL when no config provided', () => {
        const client = new EchoSDKClient({ appId: 'test-app' });
        // @ts-ignore - accessing private property for testing
        expect(client.apiUrl).toBe('https://api.echosdk.com');
    });

    it('uses provided apiUrl from config', () => {
        const client = new EchoSDKClient({
            appId: 'test-app',
            apiUrl: 'https://custom-api.com'
        });
        // @ts-ignore
        expect(client.apiUrl).toBe('https://custom-api.com');
    });

    it('uses provided baseUrl from config as priority', () => {
        const client = new EchoSDKClient({
            appId: 'test-app',
            baseUrl: 'https://base-url.com',
            apiUrl: 'https://ignored-api.com'
        });
        // @ts-ignore
        expect(client.apiUrl).toBe('https://base-url.com');
    });

    it('uses baseUrl when apiUrl is undefined', () => {
        const client = new EchoSDKClient({
            appId: 'test-app',
            baseUrl: 'https://base-url.com'
        });
        // @ts-ignore
        expect(client.apiUrl).toBe('https://base-url.com');
    });

    describe('API Methods', () => {
        const client = new EchoSDKClient({
            appId: 'test-app',
            apiKey: 'test-key'
        });

        it('query sends correct request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    message: { id: '1', text: 'response' },
                    conversationId: 'c1'
                })
            });

            await client.query('hello');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.echosdk.com/api/query',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-key',
                        'Content-Type': 'application/json'
                    }),
                    body: expect.stringContaining('"message":"hello"')
                })
            );
        });

        it('sendFeedback sends correct request', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

            await client.sendFeedback('msg-1', true);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.echosdk.com/api/feedback',
                expect.objectContaining({
                    body: expect.stringContaining('"messageId":"msg-1"')
                })
            );
        });

        it('requestHumanHandover sends correct request', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

            await client.requestHumanHandover('conv-1');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.echosdk.com/api/handover',
                expect.objectContaining({
                    body: expect.stringContaining('"conversationId":"conv-1"')
                })
            );
        });

        it('retries on 5xx errors', async () => {
            mockFetch
                .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) }) // Fail 1
                .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) }) // Fail 2
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ message: { id: '1' } })
                }); // Success

            // @ts-ignore - reduce delay for test
            client.retryDelay = 0;

            await client.query('hello');

            expect(mockFetch).toHaveBeenCalledTimes(3);
        });

        it('does not retry on 4xx errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ message: 'Bad Request' })
            });

            await expect(client.query('hello')).rejects.toThrow('Bad Request');
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });
});
