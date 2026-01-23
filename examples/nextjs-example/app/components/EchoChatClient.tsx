'use client';

import { EchoChat } from '@echosdk/react';
import '@echosdk/react/styles';

export default function EchoChatClient() {
    return (
        <EchoChat
            appId="demo-app"
            theme="auto"
            position="bottom-right"
            greeting="Chat with EchoSDK"
            userName="Next.js User"
            onMessage={(message) => {
                console.log('New message:', message);
            }}
            onError={(error) => {
                console.error('Chat error:', error);
            }}
        />
    );
}
