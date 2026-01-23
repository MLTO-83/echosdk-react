import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
    const listRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="echo-message-list" ref={listRef}>
            {messages.length === 0 && (
                <div className="echo-message system">
                    <div className="echo-message-content">
                        Welcome! How can we help you today?
                    </div>
                </div>
            )}

            {messages.map((message) => (
                <div key={message.id} className={`echo-message ${message.sender}`}>
                    <div className="echo-message-content">
                        {message.text}
                        <div className="echo-message-timestamp">
                            {formatTimestamp(message.timestamp)}
                        </div>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="echo-message ai">
                    <div className="echo-message-content">
                        <TypingIndicator />
                    </div>
                </div>
            )}
        </div>
    );
}
