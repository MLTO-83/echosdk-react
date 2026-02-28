import { resolve } from 'node:path';

import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';

import { createApp, listApps, type App } from '../lib/api.js';
import { requireAuth } from '../lib/auth.js';
import {
  readProjectConfig,
  upsertEnvLocal,
  writeProjectConfig,
} from '../lib/config.js';

const CREATE_NEW = '__create_new__';

export async function initCommand(options: { dir: string }): Promise<void> {
  const targetDir = resolve(options.dir);
  console.log(chalk.bold('\n  EchoSDK · Init\n'));

  requireAuth(); // exits with message if not logged in or session expired

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

  // Auto-append to .env.local if it already exists in the target directory
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
