import chalk from 'chalk';
import open from 'open';
import ora from 'ora';

import { pollForToken, requestDeviceCode } from '../lib/api.js';
import { saveCredentials } from '../lib/auth.js';

export async function loginCommand(): Promise<void> {
  console.log(chalk.bold('\n  EchoSDK · Login\n'));

  // Step 1: Request a device code from the auth server
  const spinner = ora('Requesting device code…').start();
  let flow;
  try {
    flow = await requestDeviceCode();
    spinner.stop();
  } catch (err) {
    spinner.fail('Could not reach the EchoSDK auth service.');
    console.error(chalk.red(`\n  ${(err as Error).message}\n`));
    process.exit(1);
  }

  const { device_code, user_code, verification_uri, expires_in, interval } = flow;

  // Step 2: Show the user where to go and what code to enter
  console.log(
    `  ${chalk.dim('Visit:')}  ${chalk.cyan.underline(verification_uri)}`,
  );
  console.log(
    `  ${chalk.dim('Code:')}   ${chalk.bold.yellow(user_code)}\n`,
  );
  console.log(
    chalk.dim('  Opening your browser — enter the code above to authenticate.\n'),
  );

  // Best-effort browser open; user can navigate manually if it fails
  await open(verification_uri).catch(() => undefined);

  // Step 3: Poll until the user completes auth, denies, or the code expires
  const poll = ora('Waiting for browser authentication…').start();
  const expiresAt = Date.now() + expires_in * 1000;
  let pollInterval = interval;

  while (Date.now() < expiresAt) {
    await sleep(pollInterval * 1000);

    let result;
    try {
      result = await pollForToken(device_code, pollInterval);
    } catch (err) {
      if (err instanceof TypeError) {
        poll.fail('Network error — could not reach the EchoSDK auth service.');
        console.error(chalk.red('\n  Check your connection and try again.\n'));
      } else {
        poll.fail('Authentication error.');
        console.error(chalk.red(`\n  ${(err as Error).message}\n`));
      }
      process.exit(1);
    }

    switch (result.status) {
      case 'authorized': {
        saveCredentials({
          token: result.access_token,
          email: result.email,
          expiresAt: result.expires_in
            ? Date.now() + result.expires_in * 1000
            : undefined,
        });

        poll.succeed(chalk.green('Authenticated!'));

        if (result.email) {
          console.log(chalk.dim(`\n  Signed in as ${chalk.white(result.email)}`));
        }
        console.log(
          chalk.dim(
            `\n  Run ${chalk.white('npx echosdk init')} to set up your project.\n`,
          ),
        );
        return;
      }

      case 'denied':
        poll.fail('Access denied. Please try again.');
        process.exit(1);
        break;

      case 'expired':
        poll.fail('Login timed out. Please run npx echosdk login again.');
        process.exit(1);
        break;

      case 'slow_down':
        pollInterval = result.newInterval;
        break;

      // 'pending' → keep looping
    }
  }

  poll.fail('Login timed out. Please run npx echosdk login again.');
  process.exit(1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
