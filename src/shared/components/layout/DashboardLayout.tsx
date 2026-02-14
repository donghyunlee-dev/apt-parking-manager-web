import { type ReactNode, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, PanelLeft, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/shared/components/feedback/ThemeToggle';
import useUiStore from '@/shared/store/uiStore';
import { navItems } from '@/shared/constants/navigation';

interface DashboardLayoutProps {
  apartmentName: string;
  userName: string;
  navItems?: typeof navItems;
  onLogout?: () => void;
  children: ReactNode;
}

const BUILD_DATE = '2026-02-13';
const APP_VERSION = 'v1.0.0';

const DashboardLayout = ({
  apartmentName,
  userName,
  onLogout,
  children,
}: DashboardLayoutProps) => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const mobileMenuOpen = useUiStore((state) => state.mobileMenuOpen);
  const toggleMobileMenu = useUiStore((state) => state.toggleMobileMenu);
  const closeMobileMenu = useUiStore((state) => state.closeMobileMenu);

  // Close mobile menu on route change (handled by NavLink click)
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col bg-sidebar transition-all duration-200 border-r border-sidebar-border',
            sidebarOpen ? 'lg:w-60' : 'lg:w-[68px]',
          )}
        >
          {/* Logo */}
          <div className={cn('border-b border-sidebar-border', sidebarOpen ? 'px-4 py-4' : 'px-2 py-3')}>
            <div className="flex items-start justify-between">
              <div className={cn('flex items-start', sidebarOpen ? 'gap-2.5' : 'w-full justify-center')}>
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
                  <Building2 size={16} aria-hidden="true" />
                </span>
                {sidebarOpen && (
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/60">ParkingCare</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-white">{apartmentName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className={cn('flex-1 px-3 pb-4 pt-3', !sidebarOpen && 'px-2')}>
            <ul className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          sidebarOpen ? 'gap-2.5' : 'justify-center px-2',
                          isActive
                            ? 'bg-sidebar-primary/15 text-sidebar-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
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

          {/* Sidebar Bottom */}
          <div className={cn('border-t border-sidebar-border p-3', !sidebarOpen && 'px-2')}>
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-primary">
                  {userName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="text-[11px] text-sidebar-foreground/60">Operator</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-md p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-white"
                  aria-label="로그아웃"
                  title="로그아웃"
                >
                  <LogOut size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-white"
                aria-label="로그아웃"
                title="로그아웃"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Overlay Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
                      <Building2 size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/60">ParkingCare</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{apartmentName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    className="rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent"
                    aria-label="메뉴 닫기"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-4">
                  <ul className="grid gap-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-sidebar-primary/15 text-sidebar-primary'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                              )
                            }
                            aria-label={item.label}
                          >
                            <Icon size={16} aria-hidden="true" className="shrink-0" />
                            <span>{item.label}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-t border-sidebar-border p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-primary">
                      {userName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{userName}</p>
                      <p className="text-[11px] text-sidebar-foreground/60">Operator</p>
                    </div>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="rounded-md p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-white"
                      aria-label="로그아웃"
                    >
                      <LogOut size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
                aria-label="메뉴 열기"
              >
                <PanelLeft size={16} aria-hidden="true" />
              </button>
              {/* Desktop sidebar toggle */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={sidebarOpen ? '사이드 메뉴 접기' : '사이드 메뉴 펼치기'}
                aria-pressed={!sidebarOpen}
                title={sidebarOpen ? '사이드 메뉴 접기' : '사이드 메뉴 펼치기'}
              >
                <PanelLeft size={16} aria-hidden="true" className={cn('transition-transform', !sidebarOpen && 'scale-x-[-1]')} />
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 px-4 py-6 sm:px-6 sm:py-8"
          >
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </motion.main>

          <footer className="border-t border-border bg-card px-4 py-4 text-xs text-muted-foreground sm:px-6">
            <div className="mx-auto grid w-full max-w-6xl gap-2 sm:grid-cols-2 sm:items-end">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground/80">Windsoft ParkingCare</p>
                <p>Windsoft Co., Ltd. | support@windsoft.co.kr</p>
              </div>
              <div className="space-y-0.5 sm:text-right">
                <p>Build {BUILD_DATE} | {APP_VERSION}</p>
                <p>{'Copyright (c) 2026 Windsoft. All rights reserved.'}</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
