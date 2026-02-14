import type { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
}

const Tooltip = ({ label, children }: TooltipProps) => (
  <span className="group relative inline-flex">
    {children}
    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-lg opacity-0 transition group-hover:opacity-100">
      {label}
    </span>
  </span>
);

export default Tooltip;
