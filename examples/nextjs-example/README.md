# Next.js Example - echosdk

A Next.js 15 + App Router + TypeScript example demonstrating SSR-compatible integration of the EchoSDK chat component.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Demonstrated

- ✅ Server-Side Rendering (SSR) compatibility
- ✅ Next.js 15 App Router
- ✅ Client Component pattern for browser-only features
- ✅ TypeScript integration
- ✅ Tailwind CSS styling
- ✅ Theme customization
- ✅ Event callbacks

## Key Implementation Details

### Client Component Wrapper

Since EchoChat uses browser APIs (localStorage, window), it must be used in a Client Component:

```tsx
// app/components/EchoChatClient.tsx
'use client';

import { EchoChat } from 'echosdk';
import 'echosdk/styles';

export default function EchoChatClient() {
  return <EchoChat appId="your-app-id" />;
}
```

### Server Component Integration

Import the client component in your server components:

```tsx
// app/page.tsx
import EchoChatClient from './components/EchoChatClient';

export default function Home() {
  return (
    <div>
      <h1>My App</h1>
      <EchoChatClient />
    </div>
  );
}
```

## Build for Production

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [EchoSDK Documentation](../../README.md)
- [App Router Guide](https://nextjs.org/docs/app)
