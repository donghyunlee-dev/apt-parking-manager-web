import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors',
            'focus:border-ring focus:ring-2 focus:ring-ring/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-9',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
