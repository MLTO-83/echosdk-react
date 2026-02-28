import { logger } from './logger';

type EventName = 'chat_opened' | 'chat_closed' | 'message_sent' | 'error_occurred';

interface EventData {
    [key: string]: unknown;
}

export const trackEvent = (eventName: EventName, data?: EventData): void => {
    logger.debug(`Analytics: ${eventName}`, data);

    // Future: Send to analytics service
    // window.gtag?.('event', eventName, data);
    // window.analytics?.track(eventName, data);
};
