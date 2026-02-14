import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-success/10 text-success border-success/20 dark:bg-success/15 dark:text-success dark:border-success/25',
  warning: 'bg-warning/10 text-warning-foreground border-warning/20 dark:bg-warning/15 dark:text-warning dark:border-warning/25',
  error: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/15 dark:text-destructive dark:border-destructive/25',
  info: 'bg-info/10 text-info border-info/20 dark:bg-info/15 dark:text-info dark:border-info/25',
};

const StatusBadge = ({ label, variant = 'info' }: StatusBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      variantStyles[variant],
    )}
  >
    {label}
  </span>
);

export default StatusBadge;
