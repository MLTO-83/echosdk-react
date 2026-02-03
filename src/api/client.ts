import type {
    ClientConfig,
    QueryResponse,
    Context,
    ApiError,
} from '../types';

export class EchoSDKClient {
    private apiUrl: string;
    private appId: string;
    private apiKey?: string;
    private retryAttempts = 3;
    private retryDelay = 1000;

    constructor(config: ClientConfig) {
        this.apiUrl = config.baseUrl || config.apiUrl || 'https://api.echosdk.com';
        this.appId = config.appId;
        this.apiKey = config.apiKey;
    }

    async query(message: string, context?: Context): Promise<QueryResponse> {
        return this.fetchWithRetry('/api/query', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                appId: this.appId,
                message,
                context,
            }),
        });
    }

    async sendFeedback(
        messageId: string,
        helpful: boolean
    ): Promise<void> {
        await this.fetchWithRetry('/api/feedback', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                appId: this.appId,
                messageId,
                helpful,
            }),
        });
    }

    async requestHumanHandover(conversationId: string): Promise<void> {
        await this.fetchWithRetry('/api/handover', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                appId: this.appId,
                conversationId,
            }),
        });
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }

    private async fetchWithRetry<T = unknown>(
        endpoint: string,
        options: RequestInit,
        attempt = 1
    ): Promise<T> {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, options);

            if (!response.ok) {
                const error: ApiError = await response.json().catch(() => ({
                    code: 'UNKNOWN_ERROR',
                    message: 'An unknown error occurred',
                }));

                // Don't retry client errors (4xx)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(error.message || `HTTP ${response.status}`);
                }

                throw error;
            }

            return await response.json();
        } catch (error) {
            // Retry on network errors or 5xx errors
            if (attempt < this.retryAttempts) {
                await this.delay(this.retryDelay * attempt);
                return this.fetchWithRetry(endpoint, options, attempt + 1);
            }

            throw error;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
