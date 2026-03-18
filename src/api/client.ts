import type {
    ClientConfig,
    QueryResponse,
    Context,
    ApiError,
} from '../types';
import { logger } from '../utils/logger';

export class EchoSDKClient {
    private apiUrl: string;
    private appId: string;
    private apiKey?: string;
    private retryAttempts = 3;
    private retryDelay = 1000;

    constructor(config: ClientConfig) {
        this.apiUrl = config.baseUrl || config.apiUrl || 'https://echosdk.com';
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
                    const clientError = new Error(error.message || `HTTP ${response.status}`);
                    Object.assign(clientError, { shouldRetry: false });
                    logger.error(`Client error ${response.status} on ${endpoint}:`, error.message || error);
                    throw clientError;
                }

                throw error;
            }

            const data = response.status === 204 ? ({} as T) : await response.json() as T;
            return data;
        } catch (error) {
            // Don't retry if explicitly marked
            if ((error as { shouldRetry?: boolean }).shouldRetry === false) {
                throw error;
            }

            // Don't retry network errors (API completely unreachable)
            if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message === 'NetworkError when attempting to fetch resource.')) {
                const networkError = new Error('Unable to connect to the support server. Please check your internet connection and try again.');
                logger.error(`Network error on ${endpoint}: API is unreachable`);
                throw networkError;
            }

            // Retry on 5xx server errors
            if (attempt < this.retryAttempts) {
                logger.warn(`Request to ${endpoint} failed (attempt ${attempt}/${this.retryAttempts}), retrying…`);
                await this.delay(this.retryDelay * attempt);
                return this.fetchWithRetry(endpoint, options, attempt + 1);
            }

            logger.error(`Request to ${endpoint} failed after ${this.retryAttempts} attempts:`, error);
            throw error;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
