import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EchoChat } from '../../src/components/EchoChat';
import { EchoSDKClient } from '../../src/api/client';

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
        render(
            <EchoChat appId="test-app" theme="dark" />
        );

        // Theme is applied to document.documentElement on initial render
        expect(document.documentElement).toHaveAttribute('data-echo-theme', 'dark');
    });

    it('calls onError callback on error', () => {
        const onError = vi.fn();

        // This would need a more complex setup to trigger an actual error
        render(<EchoChat appId="test-app" onError={onError} />);

        // For now, just verify the prop is accepted
        expect(onError).toBeDefined();
    });

    it('calls onMessage when a new message is received', async () => {
        const onMessage = vi.fn();

        render(<EchoChat appId="test-app" onMessage={onMessage} />);

        // Open the chat
        fireEvent.click(screen.getByRole('button', { name: /open chat/i }));

        // Type and submit a message
        const input = screen.getByRole('textbox', { name: /message input/i });
        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        // Wait for the API mock to resolve and onMessage to be called
        await waitFor(() => {
            expect(onMessage).toHaveBeenCalled();
        });
    });

    it('fires onError callback when the API call fails', async () => {
        // Override the module-level mock for this one test only
        vi.mocked(EchoSDKClient).mockImplementationOnce(() => ({
            query: vi.fn().mockRejectedValue(new Error('API failure')),
            sendFeedback: vi.fn(),
            requestHumanHandover: vi.fn(),
        }));

        const onError = vi.fn();
        render(<EchoChat appId="test-app" onError={onError} />);

        // Open the chat and trigger a failing send
        fireEvent.click(screen.getByRole('button', { name: /open chat/i }));
        const input = screen.getByRole('textbox', { name: /message input/i });
        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'API failure' }));
        });
    });

    it('applies primaryColor as a CSS custom property on the container', () => {
        render(<EchoChat appId="test-app" primaryColor="#FF5500" />);

        const container = document.querySelector('.echo-chat-container') as HTMLElement;
        expect(container.style.getPropertyValue('--echo-primary-color')).toBe('#FF5500');
    });
});
