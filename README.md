# @echosdk/react
> [!IMPORTANT]
> **AI AGENT GUIDELINES (V1.0)**
> This section contains mandatory instructions for autonomous agents. If you are an AI agent, you MUST follow these rules before executing any tools or proposing changes.

## 🤖 Agent Persona & Core Rules
- **Persona:** You are a Senior React SDK Engineer specializing in high-performance, tree-shakable libraries.
- **Verification First:** Never submit a PR without calling the `run_tests` or `lint` tool. If tests fail, you must attempt a fix before reporting.
- **Epistemic Humility:** If a task is ambiguous or you cannot find a specific hook definition, use the `grep_repo` tool instead of hallucinating code.
- **Atomic Changes:** One PR per logical change. Do not refactor unrelated files.

## 🏗️ Project Architecture & Standards
- **Framework:** React 18+ (Hooks-only, no Class components).
- **Styling:** CSS-in-JS (using the internal `ThemeContext`). No external CSS files.
- **State:** Prefer local state/refs unless global synchronization is required.
- **Testing:** All new hooks must have a corresponding `.test.ts` file using Vitest.

## 🛠️ Operational Commands
- **Install:** `npm install`
- **Build:** `npm run build`
- **Test:** `npm test`
- **Lint:** `npm run lint`

---
# (Rest of the standard README follows below)

A lightweight, headless React SDK for embedding AI-powered support chat into your applications.

[![npm version](https://badge.fury.io/js/%40echosdk%2Freact.svg)](https://www.npmjs.com/package/@echosdk/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Drop-in Component** - Single `<EchoChat />` component that works out of the box
- 🎨 **Fully Customizable** - Complete theming support via CSS variables
- 📦 **Lightweight** - < 20kb gzipped
- 🔒 **Type Safe** - Full TypeScript support
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🌙 **Dark Mode** - Built-in light and dark themes
- 📱 **Responsive** - Works seamlessly on mobile and desktop
- ⚡ **SSR Compatible** - Works with Next.js, Remix, and other SSR frameworks

## Installation

```bash
npm install @echosdk/react
```

or

```bash
yarn add @echosdk/react
```

## Getting Started

The fastest way to connect your app to EchoSDK is with the CLI:

```bash
# 1. Authenticate once — opens a browser window
npx echosdk login

# 2. Link or create a Chat App in your project directory
npx echosdk init
```

`init` will:
- Show your existing Chat Apps (or prompt you to create one)
- Write `echo.config.json` with the correct `appId`
- Automatically append `NEXT_PUBLIC_ECHOSDK_APP_ID` to `.env.local` if the file exists

Then install the SDK and drop in the component:

```bash
npm install @echosdk/react
```

```tsx
import { EchoChat } from '@echosdk/react';
import '@echosdk/react/dist/style.css';

// appId comes from echo.config.json / NEXT_PUBLIC_ECHOSDK_APP_ID
<EchoChat appId="your-app-id" />
```

Other CLI commands:

| Command | Description |
|---|---|
| `npx echosdk login` | Authenticate via browser (one-time) |
| `npx echosdk init` | Generate `echo.config.json` for this project |
| `npx echosdk whoami` | Show the logged-in account |
| `npx echosdk logout` | Remove stored credentials |

---

## Quick Start (manual)

If you already have an `appId` from the EchoSDK dashboard:

```tsx
import { EchoChat } from '@echosdk/react';
import '@echosdk/react/dist/style.css';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <EchoChat appId="your-app-id" />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appId` | `string` | **required** | Your EchoSDK application ID |
| `apiUrl` | `string` | `https://echosdk.com` | Custom API endpoint |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Chat bubble position |
| `primaryColor` | `string` | `#3B82F6` | Primary brand color |
| `placeholder` | `string` | `'Type your message...'` | Input placeholder text |
| `greeting` | `string` | `'Chat with us'` | Chat window title |
| `userName` | `string` | - | User's name |
| `userEmail` | `string` | - | User's email |
| `metadata` | `object` | - | Additional context data |
| `onMessage` | `(message: Message) => void` | - | Message callback |
| `onError` | `(error: Error) => void` | - | Error callback |

## Security

### `appId` — public identifier, safe for client-side use

`appId` is a **public** application identifier, not a secret credential. It is safe to
hardcode or expose via a `NEXT_PUBLIC_` environment variable in Next.js:

```env
# .env.local
NEXT_PUBLIC_ECHOSDK_APP_ID=your-app-id
```

```tsx
<EchoChat appId={process.env.NEXT_PUBLIC_ECHOSDK_APP_ID!} />
```

### `apiKey` — secret credential, server-side only

`EchoSDKClient` accepts an optional `apiKey` that, when provided, is sent as a `Bearer`
token in the `Authorization` header. This is a real secret.

> **Never** place `apiKey` in a `NEXT_PUBLIC_` variable or any client-side bundle.

Use it only in server-side contexts (e.g. a Next.js Route Handler that proxies chat
requests), with a server-only environment variable:

```env
# .env.local — never exposed to the browser
ECHOSDK_API_KEY=sk-...
```

```ts
// app/api/echo/route.ts — server-side only
import { EchoSDKClient } from '@echosdk/react';

const client = new EchoSDKClient({
  appId: process.env.NEXT_PUBLIC_ECHOSDK_APP_ID!,  // public — NEXT_PUBLIC_ is fine
  apiKey: process.env.ECHOSDK_API_KEY,              // secret — no NEXT_PUBLIC_ prefix
});
```

| Credential | What it is | Safe in client bundle? | Recommended env var |
|---|---|---|---|
| `appId` | Public app identifier | ✅ Yes | `NEXT_PUBLIC_ECHOSDK_APP_ID` |
| `apiKey` | Secret Bearer token | ❌ No | `ECHOSDK_API_KEY` |

## Theming

Customize the appearance using CSS variables:

```tsx
<EchoChat
  appId="your-app-id"
  theme="dark"
  primaryColor="#8B5CF6"
  style={{
    '--echo-border-radius': '8px',
    '--echo-font-family': 'Inter, sans-serif',
  } as React.CSSProperties}
/>
```

### Available CSS Variables

```css
--echo-primary-color
--echo-background
--echo-surface
--echo-text-primary
--echo-text-secondary
--echo-border
--echo-border-radius
--echo-font-family
/* ... and more */
```

## Advanced Usage

### Using Hooks

```tsx
import { useChat } from '@echosdk/react';

function CustomChat() {
  const [state, actions] = useChat('your-app-id');

  return (
    <div>
      <button onClick={actions.toggleChat}>Toggle Chat</button>
      <div>Messages: {state.messages.length}</div>
    </div>
  );
}
```

### Event Callbacks

```tsx
<EchoChat
  appId="your-app-id"
  onMessage={(message) => {
    console.log('New message:', message);
  }}
  onError={(error) => {
    console.error('Chat error:', error);
  }}
/>
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type { Message, ChatState, EchoChatProps } from '@echosdk/react';
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT © [EchoSDK](https://echosdk.com)

## Links

- [Documentation](https://github.com/echosdk-react#readme)
- [Examples](https://github.com/echosdk-react/tree/main/examples)
- [Issues](https://github.com/echosdk-react/issues)
- [Changelog](https://github.com/echosdk-react/blob/main/CHANGELOG.md)
