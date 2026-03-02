import type { EchoEvent } from './types';

/**
 * Fires an EchoSDK analytics event.
 *
 * In development (window.__ECHOSDK_DEBUG__ or localStorage echosdk_debug = 'true')
 * the event is logged to the console. In production it's a no-op stub that can
 * be replaced with a real analytics destination.
 */
export function fireEchoEvent(event: EchoEvent): void {
  const debug =
    typeof window !== 'undefined' &&
    (localStorage.getItem('echosdk_debug') === 'true');

  if (debug) {
    console.debug('[EchoSDK]', `Event: ${event.name}`, event.data);
  }
}
