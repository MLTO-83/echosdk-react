// Main component
export { EchoChat } from './components/EchoChat';

// Hooks
export { useChat } from './hooks/useChat';
export { useTheme } from './hooks/useTheme';

// Types
export type {
    EchoChatProps,
    Message,
    ChatState,
    ChatActions,
    Context,
    QueryResponse,
    Source,
    ClientConfig,
} from './types';

// API Client (for advanced usage)
export { EchoSDKClient } from './api/client';
