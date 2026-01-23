import { EchoChat } from '@echosdk/react';
import '@echosdk/react/styles';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>EchoSDK React Example</h1>
        <p>A simple Vite + React application demonstrating @echosdk/react</p>
      </header>

      <main className="main">
        <section className="hero">
          <h2>Welcome to EchoSDK</h2>
          <p>
            This is a demo application showing how to integrate the EchoSDK chat
            component into your React application.
          </p>
          <p>
            Click the chat bubble in the bottom-right corner to start a conversation!
          </p>
        </section>

        <section className="features">
          <h3>Features</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <h4>🚀 Easy Integration</h4>
              <p>Just one component to add AI-powered chat to your app</p>
            </div>
            <div className="feature-card">
              <h4>🎨 Customizable</h4>
              <p>Full theming support with CSS variables</p>
            </div>
            <div className="feature-card">
              <h4>📱 Responsive</h4>
              <p>Works seamlessly on desktop and mobile</p>
            </div>
            <div className="feature-card">
              <h4>🌙 Dark Mode</h4>
              <p>Built-in light and dark themes</p>
            </div>
          </div>
        </section>

        <section className="code-example">
          <h3>Usage Example</h3>
          <pre><code>{`import { EchoChat } from '@echosdk/react';
import '@echosdk/react/styles';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <EchoChat appId="your-app-id" />
    </div>
  );
}`}</code></pre>
        </section>
      </main>

      {/* EchoSDK Chat Component */}
      <EchoChat
        appId="demo-app"
        theme="auto"
        position="bottom-right"
        greeting="Chat with EchoSDK"
        userName="Demo User"
        onMessage={(message) => {
          console.log('New message:', message);
        }}
        onError={(error) => {
          console.error('Chat error:', error);
        }}
      />
    </div>
  );
}

export default App;
