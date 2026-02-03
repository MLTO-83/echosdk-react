// API Types
export interface ClientConfig {
    appId: string;
    apiUrl?: string;
    baseUrl?: string;
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
