import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/shared/components/feedback/ThemeToggle';

export interface NavItem {
  label: string;
  to: string;
}

interface DashboardLayoutProps {
  apartmentName: string;
  userName: string;
  navItems: NavItem[];
  onLogout?: () => void;
  children: ReactNode;
}

const DashboardLayout = ({
  apartmentName,
  userName,
  navItems,
  onLogout,
  children,
}: DashboardLayoutProps) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-slate-900 dark:text-slate-100">
            ParkingCare
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {apartmentName}
          </p>
        </div>
        <nav className="px-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">관리자</p>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
            >
              로그아웃
            </button>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 px-6 py-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  </div>
);

export default DashboardLayout;
