export const validateMessage = (message: string): boolean => {
    return message.trim().length > 0 && message.length <= 5000;
};

export const sanitizeMessage = (message: string): string => {
    return message.trim().slice(0, 5000);
};
