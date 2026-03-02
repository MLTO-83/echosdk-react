import { resolve } from 'node:path';

import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';

import { createApp, listApps, type App } from '../lib/api.js';
import { requireAuth } from '../lib/auth.js';
import {
  findFile,
  readProjectConfig,
  upsertEnvFile,
  upsertEnvLocal,
  writeProjectConfig,
} from '../lib/config.js';

const CREATE_NEW = '__create_new__';

export interface InitOptions {
  dir: string;
  hydrogen?: boolean;
  nextjsCommerce?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const targetDir = resolve(options.dir);
  console.log(chalk.bold('\n  EchoSDK · Init\n'));

  requireAuth(); // exits with message if not logged in or session expired

  // Detect framework when flags are provided
  if (options.hydrogen) {
    const hydrogenConfig = findFile(targetDir, ['hydrogen.config.ts', 'hydrogen.config.js']);
    if (!hydrogenConfig) {
      console.log(
        chalk.yellow(
          '  ⚠  hydrogen.config.ts not found in this directory. Continuing anyway…\n',
        ),
      );
    } else {
      console.log(
        `  ${chalk.green('✔')} Detected Shopify Hydrogen project (${chalk.dim(hydrogenConfig)})\n`,
      );
    }
  }

  if (options.nextjsCommerce) {
    const nextConfig = findFile(targetDir, ['next.config.ts', 'next.config.js', 'next.config.mjs']);
    if (!nextConfig) {
      console.log(
        chalk.yellow(
          '  ⚠  next.config.js/ts not found in this directory. Continuing anyway…\n',
        ),
      );
    } else {
      console.log(
        `  ${chalk.green('✔')} Detected Next.js Commerce project (${chalk.dim(nextConfig)})\n`,
      );
    }
  }

  // Guard: prompt before overwriting an existing config
  const existing = readProjectConfig(targetDir);
  if (existing) {
    const overwrite = await confirm({
      message: `echo.config.json already exists (appId: ${chalk.cyan(existing.appId)}). Overwrite?`,
      default: false,
    });
    if (!overwrite) {
      console.log(chalk.dim('\n  Aborted.\n'));
      return;
    }
  }

  // Fetch the user's Chat Apps from the backend
  const spinner = ora('Fetching your Chat Apps…').start();
  let apps: App[] = [];
  try {
    apps = await listApps();
    spinner.stop();
  } catch (err) {
    spinner.fail('Failed to fetch Chat Apps.');
    console.error(chalk.red(`\n  ${(err as Error).message}\n`));
    process.exit(1);
  }

  let selectedApp: App;

  if (apps.length === 0) {
    console.log(chalk.dim("  No Chat Apps found. Let's create one.\n"));
    selectedApp = await promptCreateApp();
  } else {
    const choiceId = await select<string>({
      message: 'Select a Chat App to link, or create a new one:',
      choices: [
        ...apps.map((a) => ({
          value: a.id,
          name: `${chalk.bold(a.name)}  ${chalk.dim(a.id)}`,
        })),
        { value: CREATE_NEW, name: chalk.green('+ Create new Chat App') },
      ],
    });

    selectedApp =
      choiceId === CREATE_NEW
        ? await promptCreateApp()
        : apps.find((a) => a.id === choiceId)!;
  }

  // Write echo.config.json
  writeProjectConfig(targetDir, { appId: selectedApp.id });
  console.log(
    `\n  ${chalk.green('✔')} ${chalk.bold('echo.config.json')} written`,
  );
  console.log(`    appId: ${chalk.cyan(selectedApp.id)}`);

  // Hydrogen: write ECHOSDK_APP_ID to .env
  if (options.hydrogen) {
    const envPath = upsertEnvFile(targetDir, '.env', 'ECHOSDK_APP_ID', selectedApp.id);
    console.log(
      `  ${chalk.green('✔')} ${chalk.bold('.env')} updated`,
    );
    console.log(
      `    ${chalk.dim('ECHOSDK_APP_ID')}=${chalk.cyan(selectedApp.id)}`,
    );
    printHydrogenNextSteps(selectedApp.id, envPath);
    return;
  }

  // Next.js Commerce: write NEXT_PUBLIC_ECHOSDK_APP_ID to .env.local
  if (options.nextjsCommerce) {
    const envPath = upsertEnvFile(
      targetDir,
      '.env.local',
      'NEXT_PUBLIC_ECHOSDK_APP_ID',
      selectedApp.id,
    );
    console.log(
      `  ${chalk.green('✔')} ${chalk.bold('.env.local')} updated`,
    );
    console.log(
      `    ${chalk.dim('NEXT_PUBLIC_ECHOSDK_APP_ID')}=${chalk.cyan(selectedApp.id)}`,
    );
    printNextjsCommerceNextSteps(selectedApp.id, envPath);
    return;
  }

  // Default (vanilla Next.js / Vite) path
  const envPath = upsertEnvLocal(targetDir, selectedApp.id);
  if (envPath) {
    console.log(
      `  ${chalk.green('✔')} ${chalk.bold('.env.local')} updated`,
    );
    console.log(
      `    ${chalk.dim('NEXT_PUBLIC_ECHOSDK_APP_ID')}=${chalk.cyan(selectedApp.id)}`,
    );
  }

  printNextSteps(selectedApp.id, !!envPath);
}

async function promptCreateApp(): Promise<App> {
  const name = await input({
    message: 'New Chat App name:',
    validate: (v) => v.trim().length > 0 || 'Name is required',
  });

  const spinner = ora(`Creating "${name.trim()}"…`).start();
  try {
    const app = await createApp(name.trim());
    spinner.succeed(
      `Created: ${chalk.bold(app.name)}  ${chalk.dim(app.id)}`,
    );
    return app;
  } catch (err) {
    spinner.fail('Failed to create Chat App.');
    console.error(chalk.red(`\n  ${(err as Error).message}\n`));
    process.exit(1);
  }
}

function printHydrogenNextSteps(appId: string, _envPath: string): void {
  console.log(chalk.bold('\n  Next steps (Shopify Hydrogen)\n'));

  console.log(`  ${chalk.dim('1.')} Install the adapter\n`);
  console.log(`     ${chalk.cyan('npm install @echosdk/react @echosdk/shopify-hydrogen')}\n`);

  console.log(`  ${chalk.dim('2.')} Add the provider in your Hydrogen root\n`);
  console.log(
    chalk.dim(`     import { EchoHydrogenProvider } from '@echosdk/shopify-hydrogen';`),
  );
  console.log(
    chalk.dim(
      `     <EchoHydrogenProvider appId={Env.ECHOSDK_APP_ID} cart={cart} customer={customer} />\n`,
    ),
  );

  console.log(chalk.dim(`  Docs: https://echosdk.com/docs/hydrogen\n`));
}

function printNextjsCommerceNextSteps(appId: string, _envPath: string): void {
  console.log(chalk.bold('\n  Next steps (Next.js Commerce)\n'));

  console.log(`  ${chalk.dim('1.')} Install the adapter\n`);
  console.log(
    `     ${chalk.cyan('npm install @echosdk/react @echosdk/shopify-hydrogen')}\n`,
  );

  console.log(`  ${chalk.dim('2.')} Add the provider in your layout\n`);
  console.log(
    chalk.dim(
      `     import { EchoNextjsProvider } from '@echosdk/shopify-hydrogen/nextjs';`,
    ),
  );
  console.log(
    chalk.dim(
      `     <EchoNextjsProvider appId={process.env.NEXT_PUBLIC_ECHOSDK_APP_ID!} cart={cart} customer={customer} />\n`,
    ),
  );

  console.log(chalk.dim(`  Docs: https://echosdk.com/docs/nextjs-commerce\n`));
}

function printNextSteps(appId: string, envWritten: boolean): void {
  console.log(chalk.bold('\n  Next steps\n'));

  console.log(`  ${chalk.dim('1.')} Install the React SDK\n`);
  console.log(`     ${chalk.cyan('npm install @echosdk/react')}\n`);

  console.log(`  ${chalk.dim('2.')} Add the chat widget\n`);
  console.log(chalk.dim(`     import { EchoChat } from '@echosdk/react';`));
  console.log(chalk.dim(`     import '@echosdk/react/dist/style.css';\n`));
  console.log(chalk.dim(`     <EchoChat appId="${chalk.white(appId)}" />\n`));

  if (!envWritten) {
    // .env.local didn't exist — show the snippet to copy manually
    console.log(
      `  ${chalk.dim('3.')} For Next.js — add to ${chalk.cyan('.env.local')}\n`,
    );
    console.log(
      `     ${chalk.cyan(`NEXT_PUBLIC_ECHOSDK_APP_ID=${appId}`)}\n`,
    );
    console.log(
      chalk.dim(
        `     Then: <EchoChat appId={process.env.NEXT_PUBLIC_ECHOSDK_APP_ID!} />\n`,
      ),
    );
  } else {
    console.log(
      `  ${chalk.dim('3.')} Use the env var in your Next.js app\n`,
    );
    console.log(
      chalk.dim(
        `     <EchoChat appId={process.env.NEXT_PUBLIC_ECHOSDK_APP_ID!} />\n`,
      ),
    );
  }

  console.log(chalk.dim(`  Docs: https://echosdk.com/docs\n`));
}
