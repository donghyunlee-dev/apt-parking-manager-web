import { type MouseEvent, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, RefreshCw, RotateCcw, Info } from 'lucide-react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import SearchBar from '@/shared/components/form/SearchBar';
import DataTable from '@/shared/components/table/DataTable';
import EmptyState from '@/shared/components/feedback/EmptyState';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import useAuthStore from '@/features/auth/store';
import { fetchScanLogs, searchVehicle } from './api';
import type { ScanLog, VehicleSearchResult } from './types';

const vehicleTypeLabel: Record<ScanLog['vehicle_type'], string> = {
  resident: '입주민',
  visitor: '방문',
  unregistered: '미등록',
};

const vehicleTypeBadgeVariant: Record<ScanLog['vehicle_type'], 'success' | 'info' | 'warning'> = {
  resident: 'success',
  visitor: 'info',
  unregistered: 'warning',
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
    data: VehicleSearchResult | null;
  }>({ status: 'idle', data: null });

  const handleSearch = async () => {
    if (!searchNumber) return;
    setSearchResult({ status: 'loading', data: null });
    try {
      const data = await searchVehicle(searchNumber);
      setSearchResult({ status: 'done', data: data as VehicleSearchResult });
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
          <Badge variant={vehicleTypeBadgeVariant[row.vehicle_type]}>
            {vehicleTypeLabel[row.vehicle_type]}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <DashboardLayout
      apartmentName={apartmentName}
      userName={userName}
      onLogout={logout}
    >
      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">차량 조회</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              차량 번호와 기간 조건으로 조회하고 스캔 로그를 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchNumber('');
                setSearchResult({ status: 'idle', data: null });
              }}
            >
              <RotateCcw size={14} aria-hidden="true" />
              초기화
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetch(); }}
            >
              <RefreshCw size={14} aria-hidden="true" />
              새로고침
            </Button>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-center gap-2 rounded-lg border border-info/20 bg-info/5 px-4 py-3 text-sm text-foreground">
          <Info size={16} className="shrink-0 text-info" aria-hidden="true" />
          차량 조회 내역은 최근 스캔 데이터 기준으로 갱신됩니다.
        </div>

        {/* Search bar */}
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
              <Input
                type="date"
                value={scanFrom}
                onChange={(event) => setScanFrom(event.target.value)}
                onClick={openDatePicker}
                className="w-auto"
              />
              <span className="text-sm text-muted-foreground">~</span>
              <Input
                type="date"
                value={scanTo}
                onChange={(event) => setScanTo(event.target.value)}
                onClick={openDatePicker}
                className="w-auto"
              />
            </div>
          }
        />

        {/* Search result - structured card instead of JSON */}
        {searchResult.status === 'loading' && (
          <Card>
            <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              조회 중...
            </CardContent>
          </Card>
        )}

        {searchResult.status === 'done' && searchResult.data && (
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Car size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{searchResult.data.vehicle_number}</p>
                  <Badge variant={vehicleTypeBadgeVariant[searchResult.data.vehicle_type]}>
                    {vehicleTypeLabel[searchResult.data.vehicle_type]}
                  </Badge>
                </div>
              </div>

              {searchResult.data.details && (
                <div className="mt-4 grid gap-2 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
                  {Object.entries(searchResult.data.details).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResult.data.scan_history && searchResult.data.scan_history.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">최근 스캔 이력</p>
                  <div className="space-y-1.5">
                    {searchResult.data.scan_history.slice(0, 5).map((log) => (
                      <div key={log.log_id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{log.scan_date} {log.scan_time}</span>
                        <Badge variant={vehicleTypeBadgeVariant[log.vehicle_type]} className="text-[10px]">
                          {vehicleTypeLabel[log.vehicle_type]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {searchResult.status === 'error' && (
          <Card className="border-destructive/30">
            <CardContent className="p-6 text-sm text-destructive">
              조회 실패 - 차량번호를 확인해주세요.
            </CardContent>
          </Card>
        )}

        {/* Scan logs table */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scan Logs</div>
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
