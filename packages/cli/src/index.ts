import chalk from 'chalk';
import { Command } from 'commander';

import { initCommand } from './commands/init.js';
import { loginCommand } from './commands/login.js';
import { clearCredentials, loadCredentials } from './lib/auth.js';

const program = new Command();

program
  .name('echosdk')
  .description(
    'CLI for EchoSDK — initialize and manage your chat apps from the terminal',
  )
  .version('1.0.0');

program
  .command('login')
  .description('Authenticate with EchoSDK (opens browser — one-time setup)')
  .action(loginCommand);

program
  .command('init')
  .description('Link or create a Chat App and generate echo.config.json')
  .option('-d, --dir <path>', 'project directory to initialize', '.')
  .option('--hydrogen', 'Shopify Hydrogen project: detects hydrogen.config.ts and writes ECHOSDK_APP_ID to .env')
  .option('--nextjs-commerce', 'Next.js Commerce project: detects next.config.js/ts and writes NEXT_PUBLIC_ECHOSDK_APP_ID to .env.local')
  .action(initCommand);

program
  .command('logout')
  .description(
    'Remove locally stored credentials from ~/.echosdk/credentials.json',
  )
  .action(() => {
    const creds = loadCredentials();
    if (!creds) {
      console.log(chalk.dim('\n  Already logged out.\n'));
      return;
    }
    clearCredentials();
    console.log(chalk.green('\n  Logged out successfully.\n'));
  });

program
  .command('whoami')
  .description('Show the currently authenticated account')
  .action(() => {
    const creds = loadCredentials();
    if (!creds) {
      console.log(chalk.dim('\n  Not logged in. Run: npx echosdk login\n'));
    } else if (creds.expiresAt && Date.now() > creds.expiresAt) {
      console.log(chalk.yellow('\n  Session expired. Run: npx echosdk login\n'));
    } else {
      const identity = creds.email ?? chalk.dim('(email not stored)');
      console.log(`\n  ${chalk.bold('Logged in as:')} ${identity}\n`);
    }
  });

program.parse();
