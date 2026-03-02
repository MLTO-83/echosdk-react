import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEchoEvent } from '../src/events';

describe('fireEchoEvent', () => {
  afterEach(() => {
    localStorage.removeItem('echosdk_debug');
    vi.restoreAllMocks();
  });

  it('does not throw in production mode (no debug flag)', () => {
    expect(() => fireEchoEvent({ name: 'PAGE_VIEWED' })).not.toThrow();
  });

  it('logs to console.debug when echosdk_debug is set', () => {
    localStorage.setItem('echosdk_debug', 'true');
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    fireEchoEvent({ name: 'CART_UPDATED', data: { lineCount: 3 } });

    expect(debugSpy).toHaveBeenCalledWith('[EchoSDK]', 'Event: CART_UPDATED', { lineCount: 3 });
  });

  it('does not log to console.debug without debug flag', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    fireEchoEvent({ name: 'CUSTOMER_IDENTIFIED', data: { customerId: 'c1' } });

    expect(debugSpy).not.toHaveBeenCalled();
  });

  beforeEach(() => {
    localStorage.removeItem('echosdk_debug');
  });
});
