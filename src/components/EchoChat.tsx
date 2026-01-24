import { useEffect, useRef } from 'react';
import type { EchoChatProps } from '../types';
import { useChat } from '../hooks/useChat';
import { useTheme } from '../hooks/useTheme';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { ErrorBoundary } from './ErrorBoundary';
import '../styles/default.css';

export function EchoChat({
    appId,
    apiUrl,
    theme = 'auto',
    position = 'bottom-right',
    primaryColor,
    placeholder = 'Type your message...',
    greeting = 'Chat with us',
    userName,
    userEmail,
    metadata,
    onMessage,
    onError,
    className = '',
    style = {},
}: EchoChatProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize chat state
    const [state, actions] = useChat(appId, apiUrl, {
        userName,
        userEmail,
        metadata,
    });

    // Apply theme
    useTheme(theme, containerRef.current || undefined);

    // Handle message callbacks
    useEffect(() => {
        if (state.messages.length > 0) {
            const lastMessage = state.messages[state.messages.length - 1];
            onMessage?.(lastMessage);
        }
    }, [state.messages, onMessage]);

    // Handle error callbacks
    useEffect(() => {
        if (state.error) {
            onError?.(state.error);
        }
    }, [state.error, onError]);

    // Apply custom primary color
    useEffect(() => {
        if (primaryColor && containerRef.current) {
            containerRef.current.style.setProperty('--echo-primary-color', primaryColor);
        }
    }, [primaryColor]);

    return (
        <ErrorBoundary onError={onError}>
            <div
                ref={containerRef}
                className={`echo-chat-container ${className}`}
                style={style}
            >
                <ChatBubble
                    onClick={actions.toggleChat}
                    position={position}
                    unreadCount={0}
                />

                <ChatWindow
                    state={state}
                    actions={actions}
                    position={position}
                    greeting={greeting}
                    placeholder={placeholder}
                />
            </div>
        </ErrorBoundary>
    );
}
