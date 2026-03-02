export type EchoEventName =
  | 'PAGE_VIEWED'
  | 'CART_UPDATED'
  | 'CUSTOMER_IDENTIFIED'
  | 'CHECKOUT_STARTED'
  | 'CUSTOMER_LOGOUT';

export interface EchoEvent {
  name: EchoEventName;
  data?: Record<string, unknown>;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandiseId?: string;
}

export interface CartData {
  lines?: CartLine[];
  status?: string;
  checkoutUrl?: string;
}

export interface CustomerData {
  id?: string;
  email?: string;
  displayName?: string;
}

export interface ShopData {
  name?: string;
  domain?: string;
}
