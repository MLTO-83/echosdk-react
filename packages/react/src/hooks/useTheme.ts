import { useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';

export function useTheme(theme: Theme = 'auto', rootElement?: HTMLElement) {
    useEffect(() => {
        const root = rootElement || document.documentElement;

        const applyTheme = (resolvedTheme: 'light' | 'dark') => {
            root.setAttribute('data-echo-theme', resolvedTheme);
        };

        if (theme === 'auto') {
            // Detect system preference
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
                applyTheme(e.matches ? 'dark' : 'light');
            };

            // Initial application
            handleChange(mediaQuery);

            // Listen for changes
            mediaQuery.addEventListener('change', handleChange);

            return () => {
                mediaQuery.removeEventListener('change', handleChange);
            };
        } else {
            applyTheme(theme);
        }
    }, [theme, rootElement]);
}
