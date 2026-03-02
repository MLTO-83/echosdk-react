import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Returns the first existing path among the given candidates, or null.
 */
export function findFile(dir: string, candidates: string[]): string | null {
  for (const name of candidates) {
    const full = join(resolve(dir), name);
    if (existsSync(full)) return full;
  }
  return null;
}

/**
 * Appends or updates `key=value` in the given env file (e.g. .env or .env.local).
 * Creates the file if it doesn't exist.
 *
 * Returns the path written.
 */
export function upsertEnvFile(
  dir: string,
  envFilename: string,
  key: string,
  value: string,
): string {
  const envPath = join(resolve(dir), envFilename);
  const line = `${key}=${value}`;

  let contents = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(contents)) {
    contents = contents.replace(re, line);
  } else {
    if (contents.length > 0 && !contents.endsWith('\n')) contents += '\n';
    contents += `${line}\n`;
  }

  writeFileSync(envPath, contents);
  return envPath;
}

export interface EchoConfig {
  appId: string;
  baseUrl?: string;
}

const CONFIG_FILENAME = 'echo.config.json';

/** Writes (or overwrites) echo.config.json in the given directory. Returns the full path. */
export function writeProjectConfig(dir: string, config: EchoConfig): string {
  const path = join(resolve(dir), CONFIG_FILENAME);
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
  return path;
}

export function readProjectConfig(dir: string): EchoConfig | null {
  const path = join(resolve(dir), CONFIG_FILENAME);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as EchoConfig;
  } catch {
    return null;
  }
}

/**
 * Appends or updates NEXT_PUBLIC_ECHOSDK_APP_ID in .env.local.
 * Creates the file if it doesn't exist; updates the line if the key is
 * already present; otherwise appends.
 *
 * Returns the path written, or null if nothing was done.
 */
export function upsertEnvLocal(dir: string, appId: string): string | null {
  const envPath = join(resolve(dir), '.env.local');
  const key = 'NEXT_PUBLIC_ECHOSDK_APP_ID';
  const line = `${key}=${appId}`;

  if (!existsSync(envPath)) {
    // Only create the file if it already exists — we don't want to surprise
    // non-Next.js projects with an unexpected file. Return null to signal
    // the caller to show the snippet instead.
    return null;
  }

  let contents = readFileSync(envPath, 'utf-8');

  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(contents)) {
    // Key already present — update it in place
    contents = contents.replace(re, line);
  } else {
    // Append, ensuring there's a trailing newline before our addition
    if (contents.length > 0 && !contents.endsWith('\n')) contents += '\n';
    contents += `${line}\n`;
  }

  writeFileSync(envPath, contents);
  return envPath;
}
