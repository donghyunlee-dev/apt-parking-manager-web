import { type MouseEvent, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import SearchBar from '@/shared/components/form/SearchBar';
import DataTable from '@/shared/components/table/DataTable';
import EmptyState from '@/shared/components/feedback/EmptyState';
import useAuthStore from '@/features/auth/store';
import { fetchScanLogs, searchVehicle } from './api';
import type { ScanLog } from './types';

const navItems = [
  { label: '대시보드', to: '/dashboard' },
  { label: '경비원 관리', to: '/bouncers' },
  { label: '입주민 차량 관리', to: '/residents' },
  { label: '방문 차량 관리', to: '/visitors' },
  { label: '차량 조회', to: '/reports' },
  { label: '공지사항 관리', to: '/notices' },
];

const vehicleTypeLabel: Record<ScanLog['vehicle_type'], string> = {
  resident: '입주민',
  visitor: '방문',
  unregistered: '미등록',
};

const vehicleTypeBadgeClass: Record<ScanLog['vehicle_type'], string> = {
  resident: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200',
  visitor: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200',
  unregistered: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200',
};

const ReportPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const logout = useAuthStore((state) => state.logout);

  const today = new Date().toISOString().slice(0, 10);
  const [searchNumber, setSearchNumber] = useState('');
  const [scanFrom, setScanFrom] = useState(today);
  const [scanTo, setScanTo] = useState(today);
  const [page, setPage] = useState(1);

  const openDatePicker = (event: MouseEvent<HTMLInputElement>) => {
    event.currentTarget.showPicker?.();
  };

  const { data: scanLogs, refetch } = useQuery({
    queryKey: ['scan-logs', { scanFrom, scanTo, page }],
    queryFn: () => fetchScanLogs({ from: scanFrom || undefined, to: scanTo || undefined, page, pageSize: 10 }),
  });

  const [searchResult, setSearchResult] = useState<{
    status: 'idle' | 'loading' | 'done' | 'error';
    data: unknown | null;
  }>({ status: 'idle', data: null });

  const handleSearch = async () => {
    if (!searchNumber) return;
    setSearchResult({ status: 'loading', data: null });
    try {
      const data = await searchVehicle(searchNumber);
      setSearchResult({ status: 'done', data });
    } catch {
      setSearchResult({ status: 'error', data: null });
    }
  };

  const scanColumns = useMemo(
    () => [
      { id: 'date', header: '스캔 날짜', accessor: (row: ScanLog) => row.scan_date },
      { id: 'time', header: '시간', accessor: (row: ScanLog) => row.scan_time },
      { id: 'vehicle', header: '차량번호', accessor: (row: ScanLog) => row.vehicle_number },
      {
        id: 'type',
        header: '차량 타입',
        cell: (row: ScanLog) => (
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${vehicleTypeBadgeClass[row.vehicle_type]}`}
          >
            {vehicleTypeLabel[row.vehicle_type]}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DashboardLayout
      apartmentName={apartmentName}
      userName={userName}
      navItems={navItems}
      onLogout={logout}
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-[#2a3560] dark:bg-[#1c2140] dark:text-[#c0c9ff]">
          차량 조회 내역은 최근 스캔 데이터 기준으로 갱신됩니다.
        </div>

        <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(110deg,#eef2ff_0%,#ffffff_62%,#eff6ff_100%)] p-6 dark:border-[#24314a] dark:bg-[linear-gradient(110deg,#101f3f_0%,#0b162c_62%,#0a1226_100%)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">차량 조회</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">차량 번호와 기간 조건으로 조회하고 스캔 로그를 확인합니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-[#2f3f61] dark:text-slate-200 dark:hover:bg-[#111e39]"
                onClick={() => {
                  setSearchNumber('');
                  setSearchResult({ status: 'idle', data: null });
                }}
              >
                검색 초기화
              </button>
              <button
                type="button"
                className="h-10 rounded-md bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-400 dark:bg-[#7f86f8] dark:text-[#11162c] dark:hover:bg-[#979dff]"
                onClick={() => {
                  refetch();
                }}
              >
                로그 새로고침
              </button>
            </div>
          </div>
        </section>

        <SearchBar
          value={searchNumber}
          onChange={setSearchNumber}
          onSubmit={() => {
            setPage(1);
            handleSearch();
          }}
          filterTitle="조회 기간"
          placeholder="예: 12가3456"
          filters={
            <div className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="date"
                value={scanFrom}
                onChange={(event) => setScanFrom(event.target.value)}
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-800 dark:border-[#2a3a5b] dark:bg-[#081226] dark:text-slate-100"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">~</span>
              <input
                type="date"
                value={scanTo}
                onChange={(event) => setScanTo(event.target.value)}
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-800 dark:border-[#2a3a5b] dark:bg-[#081226] dark:text-slate-100"
              />
            </div>
          }
        />

        {searchResult.status === 'loading' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-[#24314a] dark:bg-[#0b162c] dark:text-slate-300">조회 중...</div>
        )}
        {searchResult.status === 'done' && searchResult.data ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 dark:border-[#24314a] dark:bg-[#0b162c] dark:text-slate-200">
            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Search Result</div>
            <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-[#1e2a43] dark:bg-[#081226] dark:text-slate-200">{JSON.stringify(searchResult.data, null, 2)}</pre>
          </div>
        ) : null}
        {searchResult.status === 'error' && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">조회 실패</div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#24314a] dark:bg-[#0b162c]">
          <div className="mb-3 px-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Scan Logs</div>
          {scanLogs && scanLogs.items.length > 0 ? (
            <DataTable
              columns={scanColumns}
              data={scanLogs.items}
              getRowId={(row) => row.log_id}
              pagination={{
                page,
                pageSize: 10,
                total: scanLogs.total,
                onPageChange: setPage,
              }}
            />
          ) : (
            <EmptyState title="스캔 로그가 없습니다." />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ReportPage;
