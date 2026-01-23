import type { ChatState, ChatActions } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
    state: ChatState;
    actions: ChatActions;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    greeting?: string;
}

export function ChatWindow({
    state,
    actions,
    position = 'bottom-right',
    greeting = 'Chat with us',
}: ChatWindowProps) {
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

            <MessageList messages={state.messages} isLoading={state.isLoading} />

            <MessageInput
                onSend={actions.sendMessage}
                disabled={state.isLoading}
                placeholder="Type your message..."
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
        </div>
    );
}
