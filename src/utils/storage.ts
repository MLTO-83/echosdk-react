import type { Message } from '../types';

const STORAGE_KEY = 'echosdk_conversation';

export interface StoredConversation {
    conversationId: string;
    messages: Message[];
    lastUpdated: number;
}

export const saveConversation = (data: StoredConversation): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save conversation to localStorage:', error);
    }
};

export const loadConversation = (): StoredConversation | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Failed to load conversation from localStorage:', error);
        return null;
    }
};

export const clearConversation = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear conversation from localStorage:', error);
    }
};
