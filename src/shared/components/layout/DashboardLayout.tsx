import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Bell, Building2, Car, LayoutDashboard, PanelLeft, Search, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/shared/components/feedback/ThemeToggle';
import useUiStore from '@/shared/store/uiStore';

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

const BUILD_DATE = '2026-02-13';
const APP_VERSION = 'v1.0.0';

const navIconMap: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/bouncers': Shield,
  '/residents': Car,
  '/visitors': Users,
  '/reports': Search,
  '/notices': Bell,
};

const DashboardLayout = ({
  apartmentName,
  userName,
  navItems,
  onLogout,
  children,
}: DashboardLayoutProps) => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#020817] dark:text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside
          className={cn(
            'flex w-full flex-col border-b border-slate-200 bg-white transition-all duration-200 lg:border-b-0 lg:border-r dark:border-[#24314a] dark:bg-[#0a1428]',
            sidebarOpen ? 'lg:w-60' : 'lg:w-20',
          )}
        >
          <div className={cn('border-b border-slate-200 dark:border-[#24314a]', sidebarOpen ? 'px-4 py-4' : 'px-2 py-3')}>
            <div className="relative flex items-start justify-between">
              <div className={cn('flex items-start', sidebarOpen ? 'gap-2.5' : 'w-full justify-center')}>
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white dark:bg-[#1b2945]">
                  <Building2 size={16} aria-hidden="true" />
                </span>
                {sidebarOpen && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">ParkingCare</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{apartmentName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <nav className={cn('px-3 pb-4 pt-3', !sidebarOpen && 'px-2')}>
            <ul className={cn('grid gap-1 lg:grid-cols-1', sidebarOpen ? 'grid-cols-2' : 'grid-cols-1')}>
              {navItems.map((item) => {
                const Icon = navIconMap[item.to] ?? LayoutDashboard;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition',
                          sidebarOpen ? 'gap-2.5' : 'justify-center px-2',
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-[#1b2945]'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#121f3a] dark:hover:text-slate-100',
                        )
                      }
                      aria-label={item.label}
                      title={item.label}
                    >
                      <Icon size={16} aria-hidden="true" className="shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 dark:border-[#24314a] dark:bg-[#081226]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Operator</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-[#2a3a5b] dark:bg-[#0a1428] dark:text-slate-200 dark:hover:border-[#3b4f79] dark:hover:bg-[#0e1a33]"
                aria-label={sidebarOpen ? '사이드 메뉴 접기' : '사이드 메뉴 펼치기'}
                aria-pressed={!sidebarOpen}
                title={sidebarOpen ? '사이드 메뉴 접기' : '사이드 메뉴 펼치기'}
              >
                <PanelLeft size={16} aria-hidden="true" className={cn('transition-transform', !sidebarOpen && 'scale-x-[-1]')} />
              </button>
              <ThemeToggle />
              <button
                type="button"
                onClick={onLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-[#2a3a5b] dark:text-slate-200 dark:hover:border-[#3b4f79] dark:hover:bg-[#0e1a33]"
              >
                로그아웃
              </button>
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 px-4 py-6 sm:px-6 sm:py-8"
          >
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </motion.main>
          <footer className="border-t border-slate-200 bg-white px-4 py-5 text-sm text-slate-500 sm:px-6 sm:py-6 dark:border-[#24314a] dark:bg-[#081226] dark:text-slate-400">
            <div className="mx-auto grid w-full max-w-6xl gap-3 sm:grid-cols-2 sm:items-end">
              <div className="space-y-1">
                <p className="font-medium text-slate-600 dark:text-slate-300">Windsoft ParkingCare</p>
                <p>Windsoft Co., Ltd. | support@windsoft.co.kr</p>
              </div>
              <div className="space-y-1 sm:text-right">
                <p>Build Date: {BUILD_DATE} | Version: {APP_VERSION}</p>
                <p>Copyright (c) 2026 Windsoft. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
