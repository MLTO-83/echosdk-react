const isDebug = (): boolean => {
    try {
        return localStorage.getItem('echosdk_debug') === 'true';
    } catch {
        return false;
    }
};

/* eslint-disable no-console */
export const logger = {
    debug: (...args: unknown[]): void => {
        if (isDebug()) console.debug('[EchoSDK]', ...args);
    },
    info: (...args: unknown[]): void => {
        console.info('[EchoSDK]', ...args);
    },
    warn: (...args: unknown[]): void => {
        console.warn('[EchoSDK]', ...args);
    },
    error: (...args: unknown[]): void => {
        console.error('[EchoSDK]', ...args);
    },
};
