// API Types
export interface ClientConfig {
    /**
     * Your EchoSDK application ID. This is a **public** identifier and is safe
     * to ship in client-side code and `NEXT_PUBLIC_` environment variables.
     *
     * @example
     * // Next.js: NEXT_PUBLIC_ECHOSDK_APP_ID=your-app-id
     * appId: process.env.NEXT_PUBLIC_ECHOSDK_APP_ID!
     */
    appId: string;
    apiUrl?: string;
    baseUrl?: string;
    /**
     * Optional secret API key for **server-side use only**. When provided it is
     * sent as a `Bearer` token in the `Authorization` header.
     *
     * ⚠️  Never place this value in a `NEXT_PUBLIC_` variable or any client-side
     * bundle — treat it like a password.  Use it only in server-side contexts
     * (e.g. a Next.js Route Handler that proxies requests to EchoSDK).
     *
     * @example
     * // .env.local (server-only, never exposed to the browser)
     * // ECHOSDK_API_KEY=sk-...
     * apiKey: process.env.ECHOSDK_API_KEY  // no NEXT_PUBLIC_ prefix
     */
    apiKey?: string;
}

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai' | 'system';
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface Context {
    conversationId?: string;
    userName?: string;
    userEmail?: string;
    metadata?: Record<string, unknown>;
}

export interface QueryResponse {
    message: Message;
    conversationId: string;
    sources?: Source[];
}

export interface Source {
    title: string;
    url?: string;
    snippet?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

// Component Props
export interface EchoChatProps {
    appId: string;
    apiUrl?: string;
    baseUrl?: string;
    theme?: 'light' | 'dark' | 'auto';
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    primaryColor?: string;
    placeholder?: string;
    greeting?: string;
    avatar?: string;
    userName?: string;
    userEmail?: string;
    metadata?: Record<string, unknown>;
    onMessage?: (message: Message) => void;
    onError?: (error: Error) => void;
    className?: string;
    style?: React.CSSProperties;
}

// Chat State
export interface ChatState {
    messages: Message[];
    isOpen: boolean;
    isLoading: boolean;
    error: Error | null;
    conversationId: string | null;
}

export interface ChatActions {
    sendMessage: (text: string) => Promise<void>;
    toggleChat: () => void;
    clearHistory: () => void;
    requestHumanHelp: () => Promise<void>;
}
