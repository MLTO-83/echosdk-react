import { useState, useCallback } from 'react';
import type { ChatState, ChatActions, Message, Source } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
    state: ChatState;
    actions: ChatActions;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    greeting?: string;
    placeholder?: string;
}

export function ChatWindow({
    state,
    actions,
    position = 'bottom-right',
    greeting = 'Chat with us',
    placeholder = 'Type your message...',
}: ChatWindowProps) {
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [handoverEmail, setHandoverEmail] = useState('');
    const [pendingHandover, setPendingHandover] = useState<{
        question: string;
        sources: string[];
    } | null>(null);
    const [handoverLoading, setHandoverLoading] = useState(false);
    const [showHandoverSuccess, setShowHandoverSuccess] = useState(false);

    const handleHandoverClick = useCallback((message: Message) => {
        // Build question context from the AI message and any preceding user message
        const msgIndex = state.messages.findIndex((m) => m.id === message.id);
        const precedingUserMsg = state.messages
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

        setPendingHandover({ question, sources });
        setShowEmailForm(true);
    }, [state.messages]);

    const handleHandoverSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingHandover || !handoverEmail || handoverLoading) return;

        setHandoverLoading(true);
        try {
            await actions.requestHandover({
                email: handoverEmail,
                question: pendingHandover.question,
                history: state.messages,
                meta: pendingHandover.sources,
                url: typeof window !== 'undefined' ? window.location.href : '',
            });

            setShowEmailForm(false);
            setShowHandoverSuccess(true);
            setHandoverEmail('');
            setPendingHandover(null);
        } catch {
            alert('Failed to send handover request. Please try again.');
        } finally {
            setHandoverLoading(false);
        }
    }, [pendingHandover, handoverEmail, handoverLoading, actions, state.messages]);

    const handleCancelHandover = useCallback(() => {
        setShowEmailForm(false);
        setHandoverEmail('');
        setPendingHandover(null);
    }, []);

    const handleCloseSuccess = useCallback(() => {
        setShowHandoverSuccess(false);
    }, []);

    if (!state.isOpen) return null;

    return (
        <div className={`echo-chat-window ${position}`} role="dialog" aria-label="Chat window">
            <div className="echo-chat-header">
                <h2 className="echo-chat-title">{greeting}</h2>
                <button
                    className="echo-chat-close"
                    onClick={actions.toggleChat}
                    aria-label="Close chat"
                    type="button"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M15 5L5 15M5 5L15 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>

            <MessageList
                messages={state.messages}
                isLoading={state.isLoading}
                onHandoverClick={handleHandoverClick}
            />

            <MessageInput
                onSend={actions.sendMessage}
                disabled={state.isLoading}
                placeholder={placeholder}
            />

            <div className="echo-chat-footer">
                Powered by{' '}
                <a
                    href="https://echosdk.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    EchoSDK
                </a>
            </div>

            {/* Email Collection Modal */}
            {showEmailForm && (
                <div className="echo-handover-overlay" onClick={handleCancelHandover}>
                    <div className="echo-handover-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="echo-handover-modal-title">Connect with a Human</h3>
                        <p className="echo-handover-modal-subtitle">
                            Enter your email so our support team can get back to you.
                        </p>
                        <form onSubmit={handleHandoverSubmit}>
                            <input
                                type="email"
                                className="echo-handover-email-input"
                                placeholder="your@email.com"
                                value={handoverEmail}
                                onChange={(e) => setHandoverEmail(e.target.value)}
                                required
                                autoFocus
                            />
                            <div className="echo-handover-modal-actions">
                                <button
                                    type="button"
                                    className="echo-handover-cancel-button"
                                    onClick={handleCancelHandover}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="echo-handover-submit-button"
                                    disabled={handoverLoading}
                                >
                                    {handoverLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showHandoverSuccess && (
                <div className="echo-handover-overlay" onClick={handleCloseSuccess}>
                    <div className="echo-handover-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="echo-handover-success-icon">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h3 className="echo-handover-modal-title">Request Sent!</h3>
                        <p className="echo-handover-modal-subtitle">
                            A support agent has been notified and will reach out to you shortly via email.
                        </p>
                        <div className="echo-handover-modal-actions">
                            <button
                                type="button"
                                className="echo-handover-submit-button"
                                onClick={handleCloseSuccess}
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
