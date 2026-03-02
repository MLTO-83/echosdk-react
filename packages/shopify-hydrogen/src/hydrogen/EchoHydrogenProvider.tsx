import React, { useEffect, useRef } from 'react';
import { EchoChat } from '@echosdk/react';
import type { EchoChatProps } from '@echosdk/react';
import { fireEchoEvent } from '../events';
import type { EchoEvent, CartData, CustomerData, ShopData } from '../types';

export interface EchoHydrogenProviderProps
  extends Omit<EchoChatProps, 'appId'> {
  appId: string;
  /**
   * GDPR/privacy consent. When false, no analytics events are fired.
   * Defaults to true.
   */
  gdprConsent?: boolean;
  /**
   * Inject the Hydrogen useCart hook result. In production this should
   * come from `useCart()` imported from `@shopify/hydrogen`.
   */
  cart?: CartData;
  /**
   * Inject the Hydrogen useCustomer hook result.
   */
  customer?: CustomerData;
  /**
   * Inject the Hydrogen useShop hook result.
   */
  shop?: ShopData;
  /**
   * Called each time an EchoSDK analytics event is fired.
   */
  onEvent?: (event: EchoEvent) => void;
}

export function EchoHydrogenProvider({
  appId,
  gdprConsent = true,
  cart,
  customer,
  shop: _shop,
  onEvent,
  ...echoChatProps
}: EchoHydrogenProviderProps): React.ReactElement {
  const prevCartLinesRef = useRef<string>('');
  const prevCustomerIdRef = useRef<string | undefined>(undefined);
  const hasPageViewedRef = useRef(false);
  const prevCartStatusRef = useRef<string>('');

  const fire = (event: EchoEvent) => {
    if (!gdprConsent) return;
    fireEchoEvent(event);
    onEvent?.(event);
  };

  // PAGE_VIEWED: fire once on mount
  useEffect(() => {
    if (!hasPageViewedRef.current) {
      hasPageViewedRef.current = true;
      fire({ name: 'PAGE_VIEWED', data: { url: window.location.href } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CART_UPDATED: fire when cart lines change
  useEffect(() => {
    if (cart === undefined) return;
    const lines = cart.lines ?? [];
    const cartKey = JSON.stringify(lines);
    if (cartKey !== prevCartLinesRef.current && prevCartLinesRef.current !== '') {
      fire({ name: 'CART_UPDATED', data: { lineCount: lines.length } });
    }
    prevCartLinesRef.current = cartKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.lines]);

  // CHECKOUT_STARTED: fire when cart status indicates checkout initiated
  useEffect(() => {
    if (cart === undefined) return;
    const status = cart.status ?? '';
    if (status !== prevCartStatusRef.current) {
      if (status === 'creating' && cart.checkoutUrl) {
        fire({ name: 'CHECKOUT_STARTED', data: { checkoutUrl: cart.checkoutUrl } });
      }
      prevCartStatusRef.current = status;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.status, cart?.checkoutUrl]);

  // CUSTOMER_IDENTIFIED / CUSTOMER_LOGOUT: fire on customer identity changes
  useEffect(() => {
    const customerId = customer?.id;
    const prevId = prevCustomerIdRef.current;

    if (customerId !== undefined && prevId === undefined && hasPageViewedRef.current) {
      fire({
        name: 'CUSTOMER_IDENTIFIED',
        data: { customerId, email: customer?.email, displayName: customer?.displayName },
      });
    } else if (customerId === undefined && prevId !== undefined) {
      fire({ name: 'CUSTOMER_LOGOUT', data: { customerId: prevId } });
    }

    prevCustomerIdRef.current = customerId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  return <EchoChat appId={appId} {...echoChatProps} />;
}
