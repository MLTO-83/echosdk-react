import { loadCredentials } from './auth.js';

const API_BASE =
  process.env.ECHOSDK_API_URL ?? 'https://api.echosdk.com';

const CLIENT_ID =
  process.env.ECHOSDK_CLIENT_ID ?? 'echosdk-cli';

// ── Auth / Device Code Flow (RFC 8628) ───────────────────────────────────────

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  /** Seconds until the device_code expires. */
  expires_in: number;
  /** Seconds to wait between polling attempts. */
  interval: number;
}

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  return post<DeviceCodeResponse>('/auth/device', { client_id: CLIENT_ID }, false);
}

export type PollResult =
  | { status: 'authorized'; access_token: string; email?: string; expires_in?: number }
  | { status: 'pending' }
  | { status: 'slow_down'; newInterval: number }
  | { status: 'denied' };

/**
 * Polls the token endpoint once. Returns the result type; the caller is
 * responsible for sleeping between calls.
 */
export async function pollForToken(
  deviceCode: string,
  currentInterval: number,
): Promise<PollResult> {
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      device_code: deviceCode,
      client_id: CLIENT_ID,
    }),
  });

  if (res.ok) {
    const data = (await res.json()) as {
      access_token: string;
      email?: string;
      expires_in?: number;
    };
    return { status: 'authorized', ...data };
  }

  const err = (await res.json().catch(() => ({ error: 'unknown_error' }))) as {
    error: string;
  };

  switch (err.error) {
    case 'authorization_pending':
      return { status: 'pending' };
    case 'slow_down':
      // RFC 8628 §3.5: increase interval by 5 seconds
      return { status: 'slow_down', newInterval: currentInterval + 5 };
    case 'access_denied':
      return { status: 'denied' };
    default:
      throw new Error(err.error ?? `HTTP ${res.status}`);
  }
}

// ── Apps ─────────────────────────────────────────────────────────────────────

export interface App {
  id: string;
  name: string;
  createdAt: string;
}

export async function listApps(): Promise<App[]> {
  return get<App[]>('/v1/apps');
}

export async function createApp(name: string): Promise<App> {
  return post<App>('/v1/apps', { name });
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  return handleResponse<T>(res);
}

async function post<T>(path: string, body: unknown, auth = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

function authHeaders(): Record<string, string> {
  const creds = loadCredentials();
  return creds ? { Authorization: `Bearer ${creds.token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = (await res.json().catch(() => ({ message: res.statusText }))) as {
    message?: string;
  };
  throw new Error(err.message ?? `HTTP ${res.status}`);
}
