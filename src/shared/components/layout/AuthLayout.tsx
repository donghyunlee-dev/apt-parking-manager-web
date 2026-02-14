import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Building2, Car, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/shared/components/feedback/ThemeToggle';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="flex min-h-screen">
      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sidebar-primary/10 blur-3xl" />
        <div className="absolute -left-10 bottom-20 h-48 w-48 rounded-full bg-sidebar-primary/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
              <Building2 size={18} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              ParkingCare
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold leading-tight text-white text-balance">
            {'Smart parking management for your apartment community'}
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-sidebar-foreground">
            {'Efficiently manage resident and visitor vehicles, monitor parking in real-time, and simplify your property management workflow.'}
          </p>
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
              <Car size={16} className="text-sidebar-primary" />
              <span>Vehicle Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
              <ShieldCheck size={16} className="text-sidebar-primary" />
              <span>Security Management</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-sidebar-foreground/50">
          {'Windsoft Co., Ltd. | support@windsoft.co.kr'}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 lg:hidden mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 size={16} aria-hidden="true" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                  ParkingCare
                </span>
              </div>
              {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
              {subtitle && (
                <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <ThemeToggle />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
