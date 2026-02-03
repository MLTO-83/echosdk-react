import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageList } from '../../src/components/MessageList';
import { MessageInput } from '../../src/components/MessageInput';
import { ChatBubble } from '../../src/components/ChatBubble';
import type { Message } from '../../src/types';

describe('UI Components', () => {
    describe('MessageList', () => {
        it('renders messages correctly', () => {
            const messages: Message[] = [
                { id: '1', text: 'User msg', sender: 'user', timestamp: Date.now() },
                { id: '2', text: 'AI msg', sender: 'ai', timestamp: Date.now() }
            ];

            // Mock scrollIntoView
            window.HTMLElement.prototype.scrollIntoView = vi.fn();

            render(<MessageList messages={messages} />);

            expect(screen.getByText('User msg')).toBeInTheDocument();
            expect(screen.getByText('AI msg')).toBeInTheDocument();
        });

        it('renders typing indicator', () => {
            const { container } = render(<MessageList messages={[]} isLoading={true} />);
            expect(container.querySelector('.echo-typing-indicator')).toBeInTheDocument();
        });
    });

    describe('MessageInput', () => {
        it('handles input and submission', () => {
            const onSend = vi.fn();
            render(<MessageInput onSend={onSend} />);

            const input = screen.getByPlaceholderText(/Type your message/i);
            const button = screen.getByRole('button');

            fireEvent.change(input, { target: { value: 'hello' } });
            fireEvent.click(button);

            expect(onSend).toHaveBeenCalledWith('hello');
            expect(input).toHaveValue('');
        });

        it('disables input when loading', () => {
            render(<MessageInput onSend={vi.fn()} disabled={true} />);
            const input = screen.getByPlaceholderText(/Type your message/i);
            expect(input).toBeDisabled();
        });

        it('sends on enter key', () => {
            const onSend = vi.fn();
            render(<MessageInput onSend={onSend} />);

            const input = screen.getByPlaceholderText(/Type your message/i);
            fireEvent.change(input, { target: { value: 'hello' } });
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

            expect(onSend).toHaveBeenCalledWith('hello');
        });
    });

    describe('ChatBubble', () => {
        it('shows unread count', () => {
            render(<ChatBubble onClick={vi.fn()} unreadCount={5} />);
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('calls onClick', () => {
            const onClick = vi.fn();
            render(<ChatBubble onClick={onClick} />);
            fireEvent.click(screen.getByRole('button'));
            expect(onClick).toHaveBeenCalled();
        });
    });
});
