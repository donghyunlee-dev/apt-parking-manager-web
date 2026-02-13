import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import useAuthStore from '@/features/auth/store';
import { fetchDashboardStats, fetchDailyReport } from '@/features/report/api';
import { fetchVisitorStatistics } from '@/features/visitor/api';

const navItems = [
  { label: '대시보드', to: '/dashboard' },
  { label: '경비원 관리', to: '/bouncers' },
  { label: '입주민 차량 관리', to: '/residents' },
  { label: '방문 차량 관리', to: '/visitors' },
  { label: '차량 조회', to: '/reports' },
  { label: '공지사항 관리', to: '/notices' },
];

const DashboardPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const logout = useAuthStore((state) => state.logout);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 15000,
  });

  const { data: dailyReport } = useQuery({
    queryKey: ['daily-report'],
    queryFn: fetchDailyReport,
  });

  const { data: visitorStats } = useQuery({
    queryKey: ['visitor-statistics'],
    queryFn: fetchVisitorStatistics,
  });

  return (
    <DashboardLayout
      apartmentName={apartmentName}
      userName={userName}
      navItems={navItems}
      onLogout={logout}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">대시보드</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            오늘 현황과 방문 통계를 한눈에 확인합니다.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">입주민 차량</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats?.total_resident_vehicles ?? '-'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">방문 차량</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats?.total_visitor_vehicles ?? '-'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">오늘 스캔</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats?.today_scan_count ?? '-'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">무등록 스캔</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats?.today_unregistered_count ?? '-'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">유효 방문</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats?.active_visitors ?? '-'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">만료 방문</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats?.expired_visitors ?? '-'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">총 방문 횟수</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {visitorStats?.summary.total_visits ?? '-'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">일간 스캔 리포트</p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyReport?.items ?? []}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">방문 추이</p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitorStats?.byDate ?? []}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
