import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '@/shared/components/feedback/ThemeToggle';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-extrabold uppercase tracking-[0.25em] text-slate-900 dark:text-slate-100">
            ParkingCare
          </p>
          {title && <h1 className="mt-2 text-2xl font-semibold">{title}</h1>}
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {children}
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
