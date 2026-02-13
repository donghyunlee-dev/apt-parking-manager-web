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

  const { data: scanLogs } = useQuery({
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
      { id: 'type', header: '차량 타입', accessor: (row: ScanLog) => row.vehicle_type },
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
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">차량 조회</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            차량 번호와 기간 조건으로 조회하고 스캔 로그를 확인합니다.
          </p>
        </div>

        <SearchBar
          value={searchNumber}
          onChange={setSearchNumber}
          onSubmit={() => {
            setPage(1);
            handleSearch();
          }}
          placeholder="차량번호로 조회"
          filters={
            <div className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="date"
                value={scanFrom}
                onChange={(event) => setScanFrom(event.target.value)}
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">~</span>
              <input
                type="date"
                value={scanTo}
                onChange={(event) => setScanTo(event.target.value)}
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          }
        />

        {searchResult.status === 'loading' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            조회 중...
          </div>
        )}
        {searchResult.status === 'done' && searchResult.data ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <pre className="whitespace-pre-wrap">{JSON.stringify(searchResult.data, null, 2)}</pre>
          </div>
        ) : null}
        {searchResult.status === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-900/20 dark:text-rose-200">
            조회 실패
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportPage;

