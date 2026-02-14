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
    <div className="flex items-center gap-1 rounded-md border border-border bg-muted p-1">
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
                ? 'rounded bg-card px-2 py-1 text-xs text-foreground shadow-sm'
                : 'rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
