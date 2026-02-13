import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
    {icon && <div className="mb-3 text-slate-400">{icon}</div>}
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
    {description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
