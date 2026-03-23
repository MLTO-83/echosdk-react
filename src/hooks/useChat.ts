import { useState, useCallback, useEffect, useRef } from 'react';
import { EchoSDKClient } from '../api/client';
import type { Message, ChatState, ChatActions, Context, HandoverPayload, Source } from '../types';
import {
    saveConversation,
    loadConversation,
    clearConversation,
} from '../utils/storage';
import { validateMessage, sanitizeMessage } from '../utils/validators';
import { trackEvent } from '../utils/analytics';
import { logger } from '../utils/logger';

export function useChat(
    appId: string,
    apiUrl?: string,
    apiKey?: string,
    context?: Context
): [ChatState, ChatActions] {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [handoverPending, setHandoverPending] = useState(false);

    const clientRef = useRef<EchoSDKClient>();
    const handoverContextRef = useRef<{
        question: string;
        sources: string[];
    } | null>(null);

    // Initialize client
    useEffect(() => {
        clientRef.current = new EchoSDKClient({ appId, apiUrl, apiKey });

        // Load persisted conversation
        const stored = loadConversation();
        if (stored) {
            setMessages(stored.messages);
            setConversationId(stored.conversationId);
        }
    }, [appId, apiUrl, apiKey]);

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

            // If handover is pending, treat input as email submission
            if (handoverPending && handoverContextRef.current) {
                const email = text.trim();

                // Basic email validation
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    const errorMsg: Message = {
                        id: `msg_${Date.now()}_system`,
                        text: 'That doesn\'t look like a valid email address. Please try again.',
                        sender: 'system',
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, errorMsg]);
                    return;
                }

                // Show the email as a user message
                const userMsg: Message = {
                    id: `msg_${Date.now()}_user`,
                    text: email,
                    sender: 'user',
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, userMsg]);
                setIsLoading(true);

                try {
                    const payload: HandoverPayload = {
                        appId,
                        email,
                        question: handoverContextRef.current.question,
                        history: messages,
                        meta: handoverContextRef.current.sources,
                        url: typeof window !== 'undefined' ? window.location.href : '',
                    };

                    await clientRef.current.requestHandoverWithContext(payload);

                    const successMsg: Message = {
                        id: `msg_${Date.now()}_system`,
                        text: 'Request sent! A support agent has been notified and will reach out to you shortly via email.',
                        sender: 'system',
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, successMsg]);
                } catch (err) {
                    const error = err instanceof Error ? err : new Error('Unknown error');
                    logger.error('Handover request failed:', error.message);
                    const errorMsg: Message = {
                        id: `msg_${Date.now()}_system`,
                        text: 'Failed to send your request. Please try again.',
                        sender: 'system',
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, errorMsg]);
                } finally {
                    setIsLoading(false);
                    setHandoverPending(false);
                    handoverContextRef.current = null;
                }
                return;
            }

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
                logger.error('sendMessage failed:', error.message);
                trackEvent('error_occurred', { error: error.message });

                // Remove optimistic message on error
                setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId, context, handoverPending, messages, appId]
    );

    const toggleChat = useCallback(() => {
        setIsOpen((prev) => {
            const newState = !prev;
            trackEvent(newState ? 'chat_opened' : 'chat_closed', { appId });
            return newState;
        });
    }, [appId]);

    const clearHistory = useCallback(() => {
        setMessages([]);
        setConversationId(null);
        setHandoverPending(false);
        handoverContextRef.current = null;
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

    const requestHandover = useCallback(
        async (payload: Omit<HandoverPayload, 'appId'>) => {
            if (!clientRef.current) return;

            const fullPayload: HandoverPayload = {
                appId,
                ...payload,
            };

            await clientRef.current.requestHandoverWithContext(fullPayload);

            const systemMessage: Message = {
                id: `msg_${Date.now()}_system`,
                text: 'A human agent will join the conversation shortly.',
                sender: 'system',
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, systemMessage]);
        },
        [appId]
    );

    const startHandover = useCallback((message: Message) => {
        // Build question context from the AI message and any preceding user message
        const msgIndex = messages.findIndex((m) => m.id === message.id);
        const precedingUserMsg = messages
            .slice(0, msgIndex)
            .reverse()
            .find((m) => m.sender === 'user');

        const question = precedingUserMsg
            ? `User: ${precedingUserMsg.text}\nAssistant: ${message.text}`
            : message.text;

        // Extract sources from message metadata if available
        const sources: string[] = [];
        if (message.metadata?.sources) {
            const rawSources = message.metadata.sources as Source[];
            for (const s of rawSources) {
                if (s.url) sources.push(s.url);
            }
        }

        handoverContextRef.current = { question, sources };
        setHandoverPending(true);

        // Add a prompt message styled as AI
        const promptMsg: Message = {
            id: `msg_${Date.now()}_system`,
            text: 'I\'ll connect you with a human agent. Please enter your email address below so our support team can get back to you.',
            sender: 'system',
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, promptMsg]);
    }, [messages]);

    const cancelHandover = useCallback(() => {
        setHandoverPending(false);
        handoverContextRef.current = null;
    }, []);

    const state: ChatState = {
        messages,
        isOpen,
        isLoading,
        error,
        conversationId,
        handoverPending,
    };

    const actions: ChatActions = {
        sendMessage,
        toggleChat,
        clearHistory,
        requestHumanHelp,
        requestHandover,
        startHandover,
        cancelHandover,
    };

    return [state, actions];
}
