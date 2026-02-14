import { type MouseEvent, useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import SearchBar from '@/shared/components/form/SearchBar';
import DataTable from '@/shared/components/table/DataTable';
import StatusBadge from '@/shared/components/feedback/StatusBadge';
import Modal from '@/shared/components/feedback/Modal';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import FormField from '@/shared/components/form/FormField';
import Skeleton from '@/shared/components/feedback/Skeleton';
import useAuthStore from '@/features/auth/store';
import useUiStore from '@/shared/store/uiStore';
import type { VisitHistory, VisitorListResponse, VisitorVehicle } from './types';
import {
  createVisitorVehicle,
  deleteVisitorVehicle,
  fetchVisitorHistory,
  fetchVisitorVehicles,
  updateVisitorVehicle,
} from './api';
import { calcDday, calcStatus, formatDate } from './utils';

const navItems = [
  { label: '대시보드', to: '/dashboard' },
  { label: '경비원 관리', to: '/bouncers' },
  { label: '입주민 차량 관리', to: '/residents' },
  { label: '방문 차량 관리', to: '/visitors' },
  { label: '차량 조회', to: '/reports' },
  { label: '공지사항 관리', to: '/notices' },
];

const formSchema = z.object({
  building: z.string().min(1, '동을 입력하세요.'),
  unit: z.string().min(1, '호수를 입력하세요.'),
  vehicle_number: z.string().min(1, '차량번호를 입력하세요.'),
  visitor_phone: z.string().min(1, '연락처를 입력하세요.'),
  visit_start_date: z.string().min(1, '시작일을 입력하세요.'),
  visit_end_date: z.string().min(1, '종료일을 입력하세요.'),
});

type FormValues = z.infer<typeof formSchema>;

const VisitorPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useUiStore((state) => state.pushToast);

  const today = new Date().toISOString().slice(0, 10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'expired' | ''>('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VisitorVehicle | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<VisitHistory[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorVehicle | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VisitorVehicle | null>(null);

  const queryClient = useQueryClient();

  const openDatePicker = (event: MouseEvent<HTMLInputElement>) => {
    event.currentTarget.showPicker?.();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['visitor-vehicles', { search, status, startDate, endDate, page }],
    queryFn: () =>
      fetchVisitorVehicles({
        vehicle_number: search || undefined,
        building: search || undefined,
        unit: search || undefined,
        phone: search || undefined,
        status: status || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        pageSize: 10,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createVisitorVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitor-vehicles'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '방문 차량을 등록했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '등록에 실패했습니다.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) =>
      updateVisitorVehicle(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitor-vehicles'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '방문 차량 정보를 수정했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '수정에 실패했습니다.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVisitorVehicle,
    onSuccess: (_, visitorId) => {
      queryClient.setQueriesData<VisitorListResponse>(
        { queryKey: ['visitor-vehicles'] },
        (cached) => {
          if (!cached) return cached;
          const nextItems = cached.items.filter((item) => item.visitor_id !== visitorId);
          const removedCount = cached.items.length - nextItems.length;
          if (removedCount === 0) return cached;

          return {
            ...cached,
            items: nextItems,
            total: Math.max(cached.total - removedCount, 0),
          };
        },
      );
      setConfirmOpen(false);
      setDeleteTarget(null);
      pushToast({ type: 'success', message: '삭제되었습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '삭제에 실패했습니다.' }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      building: '',
      unit: '',
      vehicle_number: '',
      visitor_phone: '',
      visit_start_date: today,
      visit_end_date: today,
    },
  });

  const openHistory = useCallback(async (row: VisitorVehicle) => {
    const result = await fetchVisitorHistory(row.visitor_id);
    setHistoryItems(result.items);
    setSelectedVisitor(row);
    setHistoryOpen(true);
  }, []);

  const columns = [
    {
      id: 'unit',
      header: '방문 호수',
      accessor: (row: VisitorVehicle) => `${row.building}동 ${row.unit}호`,
    },
    { id: 'vehicle', header: '차량번호', accessor: (row: VisitorVehicle) => row.vehicle_number },
    { id: 'phone', header: '연락처', accessor: (row: VisitorVehicle) => row.visitor_phone },
    {
      id: 'period',
      header: '방문 기간',
      accessor: (row: VisitorVehicle) =>
        `${formatDate(row.visit_start_date)} ~ ${formatDate(row.visit_end_date)}`,
    },
    {
      id: 'status',
      header: '상태',
      cell: (row: VisitorVehicle) => {
        const statusLabel = calcStatus(row.visit_end_date);
        const dday = calcDday(row.visit_end_date);
        return (
          <div className="flex items-center gap-2">
            <StatusBadge
              label={statusLabel === 'active' ? '유효' : '만료'}
              variant={statusLabel === 'active' ? 'success' : 'error'}
            />
            {statusLabel === 'active' && dday <= 3 && (
              <span className="text-xs text-amber-600 dark:text-amber-300">D-{dday}</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '관리',
      align: 'right' as const,
      cell: (row: VisitorVehicle) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={(event) => {
              event.stopPropagation();
              openEditModal(row);
            }}
          >
            수정
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={(event) => {
              event.stopPropagation();
              openHistory(row);
            }}
          >
            이력
          </button>
          <button
            type="button"
            className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
            onClick={(event) => {
              event.stopPropagation();
              setDeleteTarget(row);
              setConfirmOpen(true);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  const openCreateModal = () => {
    setEditing(null);
    reset({
      building: '',
      unit: '',
      vehicle_number: '',
      visitor_phone: '',
      visit_start_date: today,
      visit_end_date: today,
    });
    setModalOpen(true);
  };

  const openEditModal = (row: VisitorVehicle) => {
    setEditing(row);
    reset({
      building: row.building,
      unit: row.unit,
      vehicle_number: row.vehicle_number,
      visitor_phone: row.visitor_phone,
      visit_start_date: row.visit_start_date,
      visit_end_date: row.visit_end_date,
    });
    setModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (values.visit_start_date > values.visit_end_date) {
      pushToast({ type: 'error', message: '시작일은 종료일보다 빠르거나 같아야 합니다.' });
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.visitor_id, values });
      return;
    }

    createMutation.mutate(values);
  };

  return (
    <DashboardLayout
      apartmentName={apartmentName}
      userName={userName}
      navItems={navItems}
      onLogout={logout}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            방문 차량 관리
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            방문 차량 등록과 방문 이력을 관리합니다.
          </p>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => setPage(1)}
          filterTitle="조회 조건"
          placeholder="차량번호, 호수, 연락처 검색"
          filters={
            <div className="flex flex-wrap gap-2">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as 'active' | 'expired' | '');
                  setPage(1);
                }}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">전체</option>
                <option value="active">유효</option>
                <option value="expired">만료</option>
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          }
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="h-10 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-900 dark:hover:bg-emerald-400"
            onClick={openCreateModal}
          >
            + 방문 차량 등록
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            getRowId={(row) => row.visitor_id}
            pagination={{
              page,
              pageSize: 10,
              total: data?.total ?? 0,
              onPageChange: setPage,
            }}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? '방문 차량 수정' : '방문 차량 등록'}
        description="방문 기간을 입력하세요."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-400 dark:text-slate-900"
              form="visitor-form"
            >
              {editing ? '수정' : '등록'}
            </button>
          </>
        }
      >
        <form id="visitor-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField id="building" label="동" required error={errors.building?.message}>
              <input
                id="building"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('building')}
              />
            </FormField>
            <FormField id="unit" label="호수" required error={errors.unit?.message}>
              <input
                id="unit"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('unit')}
              />
            </FormField>
          </div>
          <FormField
            id="vehicle_number"
            label="차량번호"
            required
            error={errors.vehicle_number?.message}
          >
            <input
              id="vehicle_number"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('vehicle_number')}
            />
          </FormField>
          <FormField
            id="visitor_phone"
            label="연락처"
            required
            error={errors.visitor_phone?.message}
          >
            <input
              id="visitor_phone"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('visitor_phone')}
            />
          </FormField>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              id="visit_start_date"
              label="시작일"
              required
              error={errors.visit_start_date?.message}
            >
              <input
                id="visit_start_date"
                type="date"
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('visit_start_date')}
              />
            </FormField>
            <FormField
              id="visit_end_date"
              label="종료일"
              required
              error={errors.visit_end_date?.message}
            >
              <input
                id="visit_end_date"
                type="date"
                onClick={openDatePicker}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('visit_end_date')}
              />
            </FormField>
          </div>
        </form>
      </Modal>

      <Modal
        open={historyOpen}
        title="방문 이력"
        description="차량별 방문 기록을 확인합니다."
        onClose={() => setHistoryOpen(false)}
      >
        <div className="flex flex-col gap-3">
          {selectedVisitor && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
              차량번호: {selectedVisitor.vehicle_number} / 방문 호수: {selectedVisitor.building}동{' '}
              {selectedVisitor.unit}호
            </div>
          )}
          {historyItems.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">방문 이력이 없습니다.</p>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.history_id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
              >
                <span>{formatDate(item.visit_date)}</span>
                <span className="text-slate-600 dark:text-slate-300">스캔 {item.scan_count}회</span>
              </div>
            ))
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="방문 차량 삭제"
        description="삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.visitor_id);
          }
        }}
      />
    </DashboardLayout>
  );
};

export default VisitorPage;
