import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
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
