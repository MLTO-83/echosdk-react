import EchoChatClient from './components/EchoChatClient';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            EchoSDK + Next.js
          </h1>
          <p className="text-xl text-purple-200">
            Server-Side Rendering Example with App Router
          </p>
        </header>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to EchoSDK
            </h2>
            <p className="text-purple-100 text-lg mb-4">
              This example demonstrates how to integrate @echosdk/react with
              Next.js 15 and the App Router.
            </p>
            <p className="text-purple-200">
              Click the chat bubble in the bottom-right corner to start a
              conversation!
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-8">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="🚀"
              title="SSR Compatible"
              description="Works seamlessly with Next.js server-side rendering"
            />
            <FeatureCard
              icon="⚡"
              title="App Router"
              description="Built for Next.js 15 App Router architecture"
            />
            <FeatureCard
              icon="🎨"
              title="Tailwind CSS"
              description="Integrates perfectly with Tailwind styling"
            />
            <FeatureCard
              icon="📱"
              title="Responsive"
              description="Mobile-first design that works everywhere"
            />
            <FeatureCard
              icon="🌙"
              title="Dark Mode"
              description="Automatic theme detection and switching"
            />
            <FeatureCard
              icon="🔒"
              title="Type Safe"
              description="Full TypeScript support out of the box"
            />
          </div>
        </section>

        {/* Code Example */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">
              Usage Example
            </h3>
            <pre className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
              <code className="text-purple-300 text-sm">
                {`// app/components/EchoChatClient.tsx
'use client';

import { EchoChat } from '@echosdk/react';
import '@echosdk/react/styles';

export default function EchoChatClient() {
  return (
    <EchoChat
      appId="your-app-id"
      theme="auto"
      position="bottom-right"
    />
  );
}

// app/page.tsx
import EchoChatClient from './components/EchoChatClient';

export default function Home() {
  return (
    <div>
      <h1>My Next.js App</h1>
      <EchoChatClient />
    </div>
  );
}`}
              </code>
            </pre>
          </div>
        </section>
      </main>

      {/* EchoChat Component */}
      <EchoChatClient />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all hover:scale-105">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-purple-200">{description}</p>
    </div>
  );
}
