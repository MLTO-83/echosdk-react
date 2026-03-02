interface ChatBubbleProps {
    onClick: () => void;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    unreadCount?: number;
}

export function ChatBubble({
    onClick,
    position = 'bottom-right',
    unreadCount = 0,
}: ChatBubbleProps) {
    return (
        <button
            className={`echo-chat-bubble ${position}`}
            onClick={onClick}
            aria-label="Open chat"
            type="button"
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                    fill="currentColor"
                />
            </svg>

            {unreadCount > 0 && (
                <span className="echo-chat-bubble-badge">{unreadCount}</span>
            )}
        </button>
    );
}
