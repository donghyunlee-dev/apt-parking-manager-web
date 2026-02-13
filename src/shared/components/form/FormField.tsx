import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
}

const FormField = ({ id, label, required, helperText, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-xs text-rose-500">{error}</p>
    ) : (
      helperText && <p className="text-xs text-slate-400 dark:text-slate-500">{helperText}</p>
    )}
  </div>
);

export default FormField;
