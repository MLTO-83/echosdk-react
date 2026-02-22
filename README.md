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

## Quick Start

```tsx
import { EchoChat } from '@echosdk/react';
import '@echosdk/react/styles';

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
| `apiUrl` | `string` | `https://api.echosdk.com` | Custom API endpoint |
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
