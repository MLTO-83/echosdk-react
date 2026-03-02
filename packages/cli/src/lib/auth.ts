import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';

export interface AuthRecord {
  token: string;
  email?: string;
  /** Unix timestamp in ms. Absent means no expiry. */
  expiresAt?: number;
}

const CONFIG_DIR = join(homedir(), '.echosdk');
const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.json');

export function saveCredentials(auth: AuthRecord): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  // 0o600 — owner read/write only; treat this file like a private key
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(auth, null, 2), {
    mode: 0o600,
  });
}

export function loadCredentials(): AuthRecord | null {
  if (!existsSync(CREDENTIALS_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8')) as AuthRecord;
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  if (existsSync(CREDENTIALS_FILE)) unlinkSync(CREDENTIALS_FILE);
}

/**
 * Returns the stored credentials or exits with a friendly error message.
 * Use this at the start of commands that require authentication.
 */
export function requireAuth(): AuthRecord {
  const creds = loadCredentials();
  if (!creds) {
    console.error('\n  Not logged in. Run: npx echosdk login\n');
    process.exit(1);
  }
  if (creds.expiresAt && Date.now() > creds.expiresAt) {
    console.error('\n  Session expired. Run: npx echosdk login\n');
    process.exit(1);
  }
  return creds;
}
