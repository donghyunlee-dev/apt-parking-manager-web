import { useTheme } from '@/shared/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, label, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500 dark:text-slate-400">테마</span>
      <button
        type="button"
        className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
        onClick={() => {
          const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
          setTheme(next);
        }}
      >
        {label}
      </button>
    </div>
  );
};

export default ThemeToggle;
