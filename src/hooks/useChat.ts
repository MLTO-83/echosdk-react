import { useState, useCallback, useEffect, useRef } from 'react';
import { EchoSDKClient } from '../api/client';
import type { Message, ChatState, ChatActions, Context } from '../types';
import {
    saveConversation,
    loadConversation,
    clearConversation,
} from '../utils/storage';
import { validateMessage, sanitizeMessage } from '../utils/validators';
import { trackEvent } from '../utils/analytics';

export function useChat(
    appId: string,
    apiUrl?: string,
    context?: Context
): [ChatState, ChatActions] {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const clientRef = useRef<EchoSDKClient>();

    // Initialize client
    useEffect(() => {
        clientRef.current = new EchoSDKClient({ appId, apiUrl });

        // Load persisted conversation
        const stored = loadConversation();
        if (stored) {
            setMessages(stored.messages);
            setConversationId(stored.conversationId);
        }
    }, [appId, apiUrl]);

    // Persist conversation on changes
    useEffect(() => {
        if (conversationId && messages.length > 0) {
            saveConversation({
                conversationId,
                messages,
                lastUpdated: Date.now(),
            });
        }
    }, [conversationId, messages]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!clientRef.current) return;
            if (!validateMessage(text)) {
                setError(new Error('Invalid message'));
                return;
            }

            const sanitized = sanitizeMessage(text);
            const userMessage: Message = {
                id: `msg_${Date.now()}_user`,
                text: sanitized,
                sender: 'user',
                timestamp: Date.now(),
            };

            // Optimistic update
            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            setError(null);

            try {
                const response = await clientRef.current.query(sanitized, {
                    ...context,
                    conversationId: conversationId || undefined,
                });

                setConversationId(response.conversationId);
                setMessages((prev) => [...prev, response.message]);
                trackEvent('message_sent', { conversationId: response.conversationId });
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error');
                setError(error);
                trackEvent('error_occurred', { error: error.message });

                // Remove optimistic message on error
                setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId, context]
    );

    const toggleChat = useCallback(() => {
        setIsOpen((prev) => {
            const newState = !prev;
            trackEvent(newState ? 'chat_opened' : 'chat_closed');
            return newState;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setMessages([]);
        setConversationId(null);
        clearConversation();
    }, []);

    const requestHumanHelp = useCallback(async () => {
        if (!clientRef.current || !conversationId) return;

        try {
            await clientRef.current.requestHumanHandover(conversationId);

            const systemMessage: Message = {
                id: `msg_${Date.now()}_system`,
                text: 'A human agent will join the conversation shortly.',
                sender: 'system',
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, systemMessage]);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
        }
    }, [conversationId]);

    const state: ChatState = {
        messages,
        isOpen,
        isLoading,
        error,
        conversationId,
    };

    const actions: ChatActions = {
        sendMessage,
        toggleChat,
        clearHistory,
        requestHumanHelp,
    };

    return [state, actions];
}
