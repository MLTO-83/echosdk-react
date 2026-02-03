import { describe, it, expect } from 'vitest';
import { EchoSDKClient } from '../../src/api/client';

describe('EchoSDKClient', () => {
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
});
