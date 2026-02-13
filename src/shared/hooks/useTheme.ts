import { useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const storageKey = 'parkingcare-theme';

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (theme: ThemeMode) => {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeMode | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
      return;
    }
    applyTheme('system');
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  const updateTheme = (next: ThemeMode) => {
    setTheme(next);
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  };

  const label = useMemo(() => {
    if (theme === 'system') return '시스템';
    return theme === 'dark' ? '다크' : '라이트';
  }, [theme]);

  return { theme, label, setTheme: updateTheme };
};
