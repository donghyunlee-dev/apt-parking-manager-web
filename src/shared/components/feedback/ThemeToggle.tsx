import { useTheme } from '@/shared/hooks/useTheme';
import type { ThemeMode } from '@/shared/hooks/useTheme';

const options: Array<{ mode: ThemeMode; symbol: string; label: string }> = [
  { mode: 'dark', symbol: '◐', label: '다크' },
  { mode: 'light', symbol: '☀', label: '라이트' },
  { mode: 'system', symbol: '◎', label: '시스템' },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 p-1 dark:border-[#2a3a5b] dark:bg-[#0b162c]">
      {options.map((option) => {
        const active = theme === option.mode;
        return (
          <button
            key={option.mode}
            type="button"
            aria-label={option.label}
            title={option.label}
            className={
              active
                ? 'rounded bg-white px-2 py-1 text-xs text-slate-900 shadow-sm dark:bg-[#131f38] dark:text-slate-100 dark:shadow-none'
                : 'rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-[#131f38] dark:hover:text-slate-200'
            }
            onClick={() => setTheme(option.mode)}
          >
            {option.symbol}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
