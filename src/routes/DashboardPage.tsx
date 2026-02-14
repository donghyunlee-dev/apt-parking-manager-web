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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import useAuthStore from '@/features/auth/store';
import { fetchDashboardStats, fetchScanLogs } from '@/features/report/api';
import { fetchVisitorStatistics } from '@/features/visitor/api';

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
      onLogout={logout}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">대시보드</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            파킹케어 핵심 지표(입주민 등록/스캔)를 중심으로 운영 포인트를 확인합니다.
          </p>
        </div>

        {/* Hero KPI + Visitor summary */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Hero card */}
          <Card className="relative overflow-hidden border-primary/20 bg-primary/5 lg:col-span-2">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
            <CardContent className="relative p-5">
              <div className="flex items-center gap-2 text-primary">
                <Building2 size={18} aria-hidden="true" />
                <p className="text-sm font-semibold">핵심 관리 포인트: 등록 입주민 차량</p>
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">
                {residentCount}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">총 등록 차량</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">오늘 스캔 대비 커버리지</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{residentFocus}%</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">미등록 스캔 알림</p>
                  <p className="mt-1 text-xl font-semibold text-destructive">{todayUnregisteredCount}건</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visitor summary */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-foreground">
                <Users size={18} aria-hidden="true" />
                <p className="text-sm font-semibold">방문 요약</p>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-muted-foreground">유효 방문</span>
                  <strong className="text-success">{stats?.active_visitors ?? '-'}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-muted-foreground">만료 방문</span>
                  <strong className="text-warning">{stats?.expired_visitors ?? '-'}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-muted-foreground">총 방문 횟수</span>
                  <strong className="text-foreground">{visitorStats?.summary.total_visits ?? '-'}</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan analysis section */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-foreground">
                  <ScanLine size={18} aria-hidden="true" />
                  <CardTitle>스캔 집중 분석</CardTitle>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  날짜를 변경해 스캔 추이와 방문 추이를 비교하세요.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                  <CalendarRange size={16} aria-hidden="true" className="text-muted-foreground" />
                  <input
                    type="date"
                    value={scanFrom}
                    onChange={(event) => setScanFrom(event.target.value)}
                    onClick={openDatePicker}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground outline-none focus:border-ring"
                  />
                  <span className="text-xs text-muted-foreground">~</span>
                  <input
                    type="date"
                    value={scanTo}
                    onChange={(event) => setScanTo(event.target.value)}
                    onClick={openDatePicker}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground outline-none focus:border-ring"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-info/20 bg-info/5 p-3">
                <p className="text-xs text-muted-foreground">전체 스캔</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{scanLogs?.total ?? 0}</p>
              </div>
              <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                <p className="text-xs text-muted-foreground">입주민 스캔</p>
                <p className="mt-1 text-xl font-semibold text-success">{scanSummary.resident}</p>
              </div>
              <div className="rounded-lg border border-info/20 bg-info/5 p-3">
                <p className="text-xs text-muted-foreground">방문 스캔</p>
                <p className="mt-1 text-xl font-semibold text-info">{scanSummary.visitor}</p>
              </div>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-center gap-1 text-destructive">
                  <AlertTriangle size={14} aria-hidden="true" />
                  <p className="text-xs">미등록 스캔</p>
                </div>
                <p className="mt-1 text-xl font-semibold text-destructive">{scanSummary.unregistered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>스캔 vs 방문 추이 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compareTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Line type="monotone" dataKey="scan" name="스캔" stroke="hsl(var(--info))" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="visitor" name="방문" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>유형별 스캔 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scanBars}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Bar dataKey="resident" name="입주민" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="visitor" name="방문" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="unregistered" name="미등록" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom KPI cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-foreground">
                <CarFront size={17} aria-hidden="true" />
                <p className="text-sm font-medium">등록 입주민 차량</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{residentCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">운영 기준이 되는 핵심 등록 모수</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-foreground">
                <ScanLine size={17} aria-hidden="true" />
                <p className="text-sm font-medium">오늘 누적 스캔</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{todayScanCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">날짜 조건은 상단 스캔 집중 분석에서 조정</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
