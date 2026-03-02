import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { EchoNextjsProvider } from '../src/nextjs/EchoNextjsProvider';
import type { CartData, CustomerData, EchoEvent } from '../src/types';

vi.mock('@echosdk/react', () => ({
  EchoChat: ({ appId }: { appId: string }) => (
    <div data-testid="echo-chat-nextjs" data-app-id={appId} />
  ),
}));

const mockFireEchoEvent = vi.fn();
vi.mock('../src/events', () => ({
  fireEchoEvent: (...args: unknown[]) => mockFireEchoEvent(...args),
}));

const TEST_APP_ID = 'nextjs-app-id';

describe('EchoNextjsProvider', () => {
  beforeEach(() => {
    mockFireEchoEvent.mockClear();
  });

  describe('Provider renders', () => {
    it('renders EchoChat with the given appId', () => {
      render(<EchoNextjsProvider appId={TEST_APP_ID} />);
      const echoChat = screen.getByTestId('echo-chat-nextjs');
      expect(echoChat).toBeInTheDocument();
      expect(echoChat).toHaveAttribute('data-app-id', TEST_APP_ID);
    });

    it('passes extra EchoChat props through', () => {
      render(
        <EchoNextjsProvider
          appId={TEST_APP_ID}
          theme="light"
          placeholder="How can we help?"
        />
      );
      expect(screen.getByTestId('echo-chat-nextjs')).toBeInTheDocument();
    });
  });

  describe('PAGE_VIEWED event', () => {
    it('fires PAGE_VIEWED on mount', () => {
      render(<EchoNextjsProvider appId={TEST_APP_ID} />);
      expect(mockFireEchoEvent).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'PAGE_VIEWED' })
      );
    });

    it('fires PAGE_VIEWED only once even with re-renders', () => {
      const { rerender } = render(<EchoNextjsProvider appId={TEST_APP_ID} />);
      rerender(<EchoNextjsProvider appId={TEST_APP_ID} />);
      const pageViewedCalls = mockFireEchoEvent.mock.calls.filter(
        ([e]) => (e as EchoEvent).name === 'PAGE_VIEWED'
      );
      expect(pageViewedCalls).toHaveLength(1);
    });

    it('does NOT fire PAGE_VIEWED when gdprConsent is false', () => {
      render(<EchoNextjsProvider appId={TEST_APP_ID} gdprConsent={false} />);
      const pageViewedCalls = mockFireEchoEvent.mock.calls.filter(
        ([e]) => (e as EchoEvent).name === 'PAGE_VIEWED'
      );
      expect(pageViewedCalls).toHaveLength(0);
    });
  });

  describe('CART_UPDATED event', () => {
    it('fires CART_UPDATED when cart lines change', () => {
      const initialCart: CartData = { lines: [{ id: 'line_a', quantity: 1 }] };
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} cart={initialCart} />
      );

      act(() => {
        rerender(
          <EchoNextjsProvider
            appId={TEST_APP_ID}
            cart={{ lines: [{ id: 'line_a', quantity: 1 }, { id: 'line_b', quantity: 1 }] }}
          />
        );
      });

      const cartUpdatedCalls = mockFireEchoEvent.mock.calls.filter(
        ([e]) => (e as EchoEvent).name === 'CART_UPDATED'
      );
      expect(cartUpdatedCalls).toHaveLength(1);
      expect(cartUpdatedCalls[0][0]).toMatchObject({
        name: 'CART_UPDATED',
        data: { lineCount: 2 },
      });
    });

    it('does NOT fire CART_UPDATED on first render', () => {
      render(
        <EchoNextjsProvider appId={TEST_APP_ID} cart={{ lines: [{ id: 'l1', quantity: 1 }] }} />
      );
      expect(mockFireEchoEvent.mock.calls.filter(([e]) => (e as EchoEvent).name === 'CART_UPDATED')).toHaveLength(0);
    });

    it('does NOT fire CART_UPDATED when gdprConsent is false', () => {
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} cart={{ lines: [] }} gdprConsent={false} />
      );
      act(() => {
        rerender(
          <EchoNextjsProvider
            appId={TEST_APP_ID}
            cart={{ lines: [{ id: 'l1', quantity: 1 }] }}
            gdprConsent={false}
          />
        );
      });
      expect(mockFireEchoEvent.mock.calls.filter(([e]) => (e as EchoEvent).name === 'CART_UPDATED')).toHaveLength(0);
    });
  });

  describe('CHECKOUT_STARTED event', () => {
    it('fires CHECKOUT_STARTED when cart status becomes "creating" with checkoutUrl', () => {
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} cart={{ status: 'idle' }} />
      );

      act(() => {
        rerender(
          <EchoNextjsProvider
            appId={TEST_APP_ID}
            cart={{ status: 'creating', checkoutUrl: 'https://commerce.example.com/checkout' }}
          />
        );
      });

      const checkoutCalls = mockFireEchoEvent.mock.calls.filter(
        ([e]) => (e as EchoEvent).name === 'CHECKOUT_STARTED'
      );
      expect(checkoutCalls).toHaveLength(1);
      expect(checkoutCalls[0][0]).toMatchObject({
        name: 'CHECKOUT_STARTED',
        data: { checkoutUrl: 'https://commerce.example.com/checkout' },
      });
    });

    it('does NOT fire CHECKOUT_STARTED when gdprConsent is false', () => {
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} cart={{ status: 'idle' }} gdprConsent={false} />
      );
      act(() => {
        rerender(
          <EchoNextjsProvider
            appId={TEST_APP_ID}
            cart={{ status: 'creating', checkoutUrl: 'https://commerce.example.com/checkout' }}
            gdprConsent={false}
          />
        );
      });
      expect(mockFireEchoEvent).not.toHaveBeenCalled();
    });
  });

  describe('CUSTOMER_IDENTIFIED event', () => {
    it('fires CUSTOMER_IDENTIFIED when a customer logs in', () => {
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} customer={undefined} />
      );

      const customer: CustomerData = {
        id: 'cust_nextjs_456',
        email: 'nextjs@example.com',
        displayName: 'NextJS User',
      };

      act(() => {
        rerender(<EchoNextjsProvider appId={TEST_APP_ID} customer={customer} />);
      });

      const identifiedCalls = mockFireEchoEvent.mock.calls.filter(
        ([e]) => (e as EchoEvent).name === 'CUSTOMER_IDENTIFIED'
      );
      expect(identifiedCalls).toHaveLength(1);
      expect(identifiedCalls[0][0]).toMatchObject({
        name: 'CUSTOMER_IDENTIFIED',
        data: {
          customerId: 'cust_nextjs_456',
          email: 'nextjs@example.com',
          displayName: 'NextJS User',
        },
      });
    });

    it('does NOT fire CUSTOMER_IDENTIFIED when gdprConsent is false', () => {
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} customer={undefined} gdprConsent={false} />
      );
      act(() => {
        rerender(
          <EchoNextjsProvider
            appId={TEST_APP_ID}
            customer={{ id: 'cust_456' }}
            gdprConsent={false}
          />
        );
      });
      expect(mockFireEchoEvent.mock.calls.filter(([e]) => (e as EchoEvent).name === 'CUSTOMER_IDENTIFIED')).toHaveLength(0);
    });
  });

  describe('CUSTOMER_LOGOUT event', () => {
    it('fires CUSTOMER_LOGOUT when customer logs out', () => {
      const customer: CustomerData = { id: 'cust_nextjs_456', email: 'user@example.com' };
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} customer={customer} />
      );

      act(() => {
        rerender(<EchoNextjsProvider appId={TEST_APP_ID} customer={undefined} />);
      });

      const logoutCalls = mockFireEchoEvent.mock.calls.filter(
        ([e]) => (e as EchoEvent).name === 'CUSTOMER_LOGOUT'
      );
      expect(logoutCalls).toHaveLength(1);
      expect(logoutCalls[0][0]).toMatchObject({
        name: 'CUSTOMER_LOGOUT',
        data: { customerId: 'cust_nextjs_456' },
      });
    });

    it('does NOT fire CUSTOMER_LOGOUT when gdprConsent is false', () => {
      const customer: CustomerData = { id: 'cust_nextjs_456' };
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} customer={customer} gdprConsent={false} />
      );
      act(() => {
        rerender(<EchoNextjsProvider appId={TEST_APP_ID} customer={undefined} gdprConsent={false} />);
      });
      expect(mockFireEchoEvent.mock.calls.filter(([e]) => (e as EchoEvent).name === 'CUSTOMER_LOGOUT')).toHaveLength(0);
    });
  });

  describe('GDPR consent blocking', () => {
    it('blocks all events when gdprConsent is false', () => {
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} gdprConsent={false} cart={{ lines: [] }} />
      );
      act(() => {
        rerender(
          <EchoNextjsProvider
            appId={TEST_APP_ID}
            gdprConsent={false}
            cart={{ lines: [{ id: 'l1', quantity: 1 }] }}
            customer={{ id: 'c1' }}
          />
        );
      });
      expect(mockFireEchoEvent).not.toHaveBeenCalled();
    });

    it('fires events after gdprConsent switches from false to true', () => {
      const { rerender } = render(
        <EchoNextjsProvider appId={TEST_APP_ID} gdprConsent={false} />
      );
      expect(mockFireEchoEvent).not.toHaveBeenCalled();

      rerender(<EchoNextjsProvider appId={TEST_APP_ID} gdprConsent={true} />);
      rerender(<EchoNextjsProvider appId={TEST_APP_ID} gdprConsent={true} cart={{ lines: [{ id: 'l1', quantity: 1 }] }} />);
      act(() => {
        rerender(
          <EchoNextjsProvider
            appId={TEST_APP_ID}
            gdprConsent={true}
            cart={{ lines: [{ id: 'l1', quantity: 2 }] }}
          />
        );
      });
      const cartUpdatedCalls = mockFireEchoEvent.mock.calls.filter(
        ([e]) => (e as EchoEvent).name === 'CART_UPDATED'
      );
      expect(cartUpdatedCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('onEvent callback', () => {
    it('calls onEvent for each fired event', () => {
      const onEvent = vi.fn();
      render(<EchoNextjsProvider appId={TEST_APP_ID} onEvent={onEvent} />);
      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining<EchoEvent>({ name: 'PAGE_VIEWED' })
      );
    });

    it('does NOT call onEvent when gdprConsent is false', () => {
      const onEvent = vi.fn();
      render(<EchoNextjsProvider appId={TEST_APP_ID} gdprConsent={false} onEvent={onEvent} />);
      expect(onEvent).not.toHaveBeenCalled();
    });
  });
});
