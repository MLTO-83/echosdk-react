import { describe, it, expect } from 'vitest';
import { validateMessage, sanitizeMessage } from '../../src/utils/validators';

describe('Validators Utils', () => {
    describe('validateMessage', () => {
        it('validates correct message', () => {
            expect(validateMessage('Hello')).toBe(true);
        });

        it('rejects empty message', () => {
            expect(validateMessage('')).toBe(false);
            expect(validateMessage('   ')).toBe(false);
        });

        it('rejects too long message', () => {
            const longMessage = 'a'.repeat(5001);
            expect(validateMessage(longMessage)).toBe(false);
        });

        it('accepts max length message', () => {
            const maxMessage = 'a'.repeat(5000);
            expect(validateMessage(maxMessage)).toBe(true);
        });
    });

    describe('sanitizeMessage', () => {
        it('trims whitespace', () => {
            expect(sanitizeMessage('  hello  ')).toBe('hello');
        });

        it('truncates message', () => {
            const longMessage = 'a'.repeat(5005);
            const sanitized = sanitizeMessage(longMessage);
            expect(sanitized.length).toBe(5000);
            expect(sanitized).toBe('a'.repeat(5000));
        });
    });
});
