type EventName = 'chat_opened' | 'chat_closed' | 'message_sent' | 'error_occurred';

interface EventData {
    [key: string]: unknown;
}

export const trackEvent = (eventName: EventName, data?: EventData): void => {
    // Basic console logging for development
    // Can be extended to integrate with analytics services
    if (typeof window !== 'undefined') {
        // Only log in development (when not minified)
        console.log(`[EchoSDK Analytics] ${eventName}`, data);
    }

    // Future: Send to analytics service
    // window.gtag?.('event', eventName, data);
    // window.analytics?.track(eventName, data);
};
