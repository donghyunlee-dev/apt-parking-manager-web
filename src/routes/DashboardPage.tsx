import { type MouseEvent, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { AlertTriangle, Building2, CalendarRange, CarFront, ScanLine, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import useAuthStore from '@/features/auth/store';
import { fetchDashboardStats, fetchScanLogs } from '@/features/report/api';
import { fetchVisitorStatistics } from '@/features/visitor/api';

const navItems = [
  { label: '대시보드', to: '/dashboard' },
  { label: '경비원 관리', to: '/bouncers' },
  { label: '입주민 차량 관리', to: '/residents' },
  { label: '방문 차량 관리', to: '/visitors' },
  { label: '차량 조회', to: '/reports' },
  { label: '공지사항 관리', to: '/notices' },
];

const toShortDate = (value: string) => value.slice(5);

const DashboardPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const logout = useAuthStore((state) => state.logout);

  const today = format(new Date(), 'yyyy-MM-dd');
  const [scanFrom, setScanFrom] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [scanTo, setScanTo] = useState(today);

  const openDatePicker = (event: MouseEvent<HTMLInputElement>) => {
    event.currentTarget.showPicker?.();
  };

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 15000,
  });

  const { data: visitorStats } = useQuery({
    queryKey: ['visitor-statistics'],
    queryFn: fetchVisitorStatistics,
  });

  const { data: scanLogs } = useQuery({
    queryKey: ['dashboard-scan-logs', { scanFrom, scanTo }],
    queryFn: () => fetchScanLogs({ from: scanFrom, to: scanTo, page: 1, pageSize: 500 }),
  });

  const residentCount = stats?.total_resident_vehicles ?? 0;
  const todayScanCount = stats?.today_scan_count ?? 0;
  const todayUnregisteredCount = stats?.today_unregistered_count ?? 0;

  const residentFocus = useMemo(() => {
    if (residentCount === 0) return 0;
    return Math.round((todayScanCount / residentCount) * 100);
  }, [residentCount, todayScanCount]);

  const scanSummary = useMemo(() => {
    const summary = { resident: 0, visitor: 0, unregistered: 0 };
    for (const item of scanLogs?.items ?? []) {
      summary[item.vehicle_type] += 1;
    }
    return summary;
  }, [scanLogs]);

  const scanTrend = useMemo(() => {
    const map = new Map<
      string,
      { date: string; scan: number; resident: number; visitor: number; unregistered: number }
    >();

    for (const item of scanLogs?.items ?? []) {
      const current = map.get(item.scan_date) ?? {
        date: item.scan_date,
        scan: 0,
        resident: 0,
        visitor: 0,
        unregistered: 0,
      };

      current.scan += 1;
      current[item.vehicle_type] += 1;
      map.set(item.scan_date, current);
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [scanLogs]);

  const compareTrend = useMemo(() => {
    const map = new Map<string, { date: string; scan: number; visitor: number }>();

    for (const item of scanTrend) {
      map.set(item.date, { date: item.date, scan: item.scan, visitor: 0 });
    }

    for (const item of visitorStats?.byDate ?? []) {
      const current = map.get(item.date) ?? { date: item.date, scan: 0, visitor: 0 };
      current.visitor = item.count;
      map.set(item.date, current);
    }

    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({ ...item, label: toShortDate(item.date) }));
  }, [scanTrend, visitorStats]);

  const scanBars = scanTrend.map((item) => ({
    ...item,
    label: toShortDate(item.date),
  }));

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
            파킹케어 핵심 지표(입주민 등록/스캔)를 중심으로 운영 포인트를 확인합니다.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-[linear-gradient(125deg,#dcfce7_0%,#ffffff_65%)] p-5 dark:border-emerald-500/40 dark:bg-[linear-gradient(125deg,#113228_0%,#0b162c_65%)] lg:col-span-2">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/50 blur-2xl dark:bg-emerald-500/20" />
            <div className="relative">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                <Building2 size={18} aria-hidden="true" />
                <p className="text-sm font-semibold">핵심 관리 포인트: 등록 입주민 차량</p>
              </div>
              <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-slate-100">
                {residentCount}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">총 등록 차량</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200/80 bg-white/70 p-3 dark:border-[#2a3a5b] dark:bg-[#0b162c]/70">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    오늘 스캔 대비 커버리지
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {residentFocus}%
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-white/70 p-3 dark:border-[#2a3a5b] dark:bg-[#0b162c]/70">
                  <p className="text-xs text-slate-500 dark:text-slate-400">미등록 스캔 알림</p>
                  <p className="mt-1 text-xl font-semibold text-rose-600 dark:text-rose-300">
                    {todayUnregisteredCount}건
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-[#24314a] dark:bg-[#0b162c]">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Users size={18} aria-hidden="true" />
              <p className="text-sm font-semibold">방문 요약</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-[#24314a]">
                <span>유효 방문</span>
                <strong className="text-emerald-600 dark:text-emerald-300">
                  {stats?.active_visitors ?? '-'}
                </strong>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-[#24314a]">
                <span>만료 방문</span>
                <strong className="text-amber-600 dark:text-amber-300">
                  {stats?.expired_visitors ?? '-'}
                </strong>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-[#24314a]">
                <span>총 방문 횟수</span>
                <strong>{visitorStats?.summary.total_visits ?? '-'}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-[#24314a] dark:bg-[#0b162c]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <ScanLine size={18} aria-hidden="true" />
                <p className="text-sm font-semibold">스캔 집중 분석</p>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                날짜를 변경해 스캔 추이와 방문 추이를 비교하세요.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 dark:border-[#2a3a5b]">
                <CalendarRange
                  size={16}
                  aria-hidden="true"
                  className="text-slate-500 dark:text-slate-300"
                />
                <input
                  type="date"
                  value={scanFrom}
                  onChange={(event) => setScanFrom(event.target.value)}
                  onClick={openDatePicker}
                  className="h-8 rounded-md border border-slate-200 px-2 text-xs dark:border-[#2a3a5b] dark:bg-[#081226] dark:text-slate-100"
                />
                <span className="text-xs text-slate-500">~</span>
                <input
                  type="date"
                  value={scanTo}
                  onChange={(event) => setScanTo(event.target.value)}
                  onClick={openDatePicker}
                  className="h-8 rounded-md border border-slate-200 px-2 text-xs dark:border-[#2a3a5b] dark:bg-[#081226] dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/40 dark:bg-sky-500/10">
              <p className="text-xs text-slate-500 dark:text-slate-300">전체 스캔</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {scanLogs?.total ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/40 dark:bg-emerald-500/10">
              <p className="text-xs text-slate-500 dark:text-slate-300">입주민 스캔</p>
              <p className="mt-1 text-xl font-semibold text-emerald-700 dark:text-emerald-200">
                {scanSummary.resident}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-500/40 dark:bg-cyan-500/10">
              <p className="text-xs text-slate-500 dark:text-slate-300">방문 스캔</p>
              <p className="mt-1 text-xl font-semibold text-cyan-700 dark:text-cyan-200">
                {scanSummary.visitor}
              </p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/40 dark:bg-rose-500/10">
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-300">
                <AlertTriangle size={14} aria-hidden="true" />
                <p className="text-xs">미등록 스캔</p>
              </div>
              <p className="mt-1 text-xl font-semibold text-rose-700 dark:text-rose-200">
                {scanSummary.unregistered}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#24314a] dark:bg-[#0b162c]">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              스캔 vs 방문 추이 비교
            </p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compareTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="scan"
                    name="스캔"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visitor"
                    name="방문"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#24314a] dark:bg-[#0b162c]">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              유형별 스캔 분포
            </p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scanBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="resident" name="입주민" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="visitor" name="방문" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unregistered" name="미등록" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#24314a] dark:bg-[#0b162c]">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <CarFront size={17} aria-hidden="true" />
              <p className="text-sm font-medium">등록 입주민 차량</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {residentCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              운영 기준이 되는 핵심 등록 모수
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#24314a] dark:bg-[#0b162c]">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <ScanLine size={17} aria-hidden="true" />
              <p className="text-sm font-medium">오늘 누적 스캔</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {todayScanCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              날짜 조건은 상단 스캔 집중 분석에서 조정
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
