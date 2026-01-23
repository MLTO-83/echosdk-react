# Vite Example - @echosdk/react

A simple Vite + React + TypeScript example demonstrating how to integrate the EchoSDK chat component.

## Setup

```bash
npm install
npm run dev
```

## Features Demonstrated

- ✅ Basic EchoChat integration
- ✅ Theme customization (auto light/dark mode)
- ✅ Event callbacks (onMessage, onError)
- ✅ Custom positioning
- ✅ User context (userName, userEmail)

## Usage

The main integration is in `src/App.tsx`:

```tsx
import { EchoChat } from '@echosdk/react';
import '@echosdk/react/styles';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <EchoChat
        appId="your-app-id"
        theme="auto"
        position="bottom-right"
        greeting="Chat with us"
        onMessage={(message) => console.log(message)}
      />
    </div>
  );
}
```

## Customization

See the [main documentation](../../README.md) for full customization options including:
- Theming with CSS variables
- Custom colors
- Position options
- Event handlers
- User metadata

## Build

```bash
npm run build
```

The production build will be in the `dist/` directory.
