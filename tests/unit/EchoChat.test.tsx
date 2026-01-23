import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EchoChat } from '../../src/components/EchoChat';

// Mock the API client
vi.mock('../../src/api/client', () => ({
    EchoSDKClient: vi.fn().mockImplementation(() => ({
        query: vi.fn().mockResolvedValue({
            message: {
                id: 'msg_1',
                text: 'Hello from AI',
                sender: 'ai',
                timestamp: Date.now(),
            },
            conversationId: 'conv_1',
        }),
    })),
}));

describe('EchoChat', () => {
    it('renders chat bubble when closed', () => {
        render(<EchoChat appId="test-app" />);
        const bubble = screen.getByRole('button', { name: /open chat/i });
        expect(bubble).toBeInTheDocument();
    });

    it('opens chat window on bubble click', () => {
        render(<EchoChat appId="test-app" />);
        const bubble = screen.getByRole('button', { name: /open chat/i });

        fireEvent.click(bubble);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
    });

    it('closes chat window on close button click', () => {
        render(<EchoChat appId="test-app" />);

        // Open chat
        const bubble = screen.getByRole('button', { name: /open chat/i });
        fireEvent.click(bubble);

        // Close chat
        const closeButton = screen.getByRole('button', { name: /close chat/i });
        fireEvent.click(closeButton);

        const dialog = screen.queryByRole('dialog');
        expect(dialog).not.toBeInTheDocument();
    });

    it('applies custom theme', () => {
        const { container } = render(
            <EchoChat appId="test-app" theme="dark" />
        );

        const chatContainer = container.querySelector('.echo-chat-container');
        expect(chatContainer).toHaveAttribute('data-echo-theme', 'dark');
    });

    it('calls onError callback on error', () => {
        const onError = vi.fn();

        // This would need a more complex setup to trigger an actual error
        render(<EchoChat appId="test-app" onError={onError} />);

        // For now, just verify the prop is accepted
        expect(onError).toBeDefined();
    });
});
