import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import DataTable from '@/shared/components/table/DataTable';
import SearchBar from '@/shared/components/form/SearchBar';
import Modal from '@/shared/components/feedback/Modal';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import FormField from '@/shared/components/form/FormField';
import StatusBadge from '@/shared/components/feedback/StatusBadge';
import EmptyState from '@/shared/components/feedback/EmptyState';
import Skeleton from '@/shared/components/feedback/Skeleton';
import useAuthStore from '@/features/auth/store';
import useUiStore from '@/shared/store/uiStore';
import {
  checkFinDuplicated,
  createBouncer,
  deleteBouncer,
  fetchBouncers,
  updateBouncer,
} from './api';
import type { Bouncer } from './types';
import { maskFin } from './utils';

const navItems = [
  { label: '대시보드', to: '/dashboard' },
  { label: '경비원 관리', to: '/bouncers' },
  { label: '입주민 차량 관리', to: '/residents' },
  { label: '방문 차량 관리', to: '/visitors' },
  { label: '차량 조회', to: '/reports' },
  { label: '공지사항 관리', to: '/notices' },
];

const formSchema = z
  .object({
    bouncer_name: z.string().min(1, '경비원 이름을 입력하세요.'),
    fin_no: z.string().regex(/^[0-9]{6}$/, 'FIN 번호는 6자리 숫자입니다.'),
    fin_no_confirm: z.string().regex(/^[0-9]{6}$/, 'FIN 번호는 6자리 숫자입니다.'),
    used: z.enum(['Y', 'N']),
  })
  .refine((data) => data.fin_no === data.fin_no_confirm, {
    message: 'FIN 번호가 일치하지 않습니다.',
    path: ['fin_no_confirm'],
  });

type FormValues = z.infer<typeof formSchema>;

const BouncerPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useUiStore((state) => state.pushToast);

  const [search, setSearch] = useState('');
  const [filterUsed, setFilterUsed] = useState<'Y' | 'N' | ''>('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bouncer | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Bouncer | null>(null);
  const [finVerified, setFinVerified] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bouncers', { search, filterUsed, page }],
    queryFn: () =>
      fetchBouncers({
        name: search || undefined,
        used: filterUsed || undefined,
        page,
        pageSize: 10,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createBouncer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bouncers'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '경비원을 등록했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '등록에 실패했습니다.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, values }: { code: string; values: FormValues }) =>
      updateBouncer(code, { bouncer_name: values.bouncer_name, fin_no: values.fin_no, used: values.used }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bouncers'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '경비원 정보를 수정했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '수정에 실패했습니다.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBouncer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bouncers'] });
      pushToast({ type: 'success', message: '경비원을 삭제했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '삭제에 실패했습니다.' }),
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { bouncer_name: '', fin_no: '', fin_no_confirm: '', used: 'Y' },
  });

  const columns = useMemo(
    () => [
      { id: 'name', header: '경비원명', accessor: (row: Bouncer) => row.bouncer_name },
      { id: 'fin', header: 'FIN 번호', accessor: (row: Bouncer) => maskFin(row.fin_no) },
      {
        id: 'used',
        header: '사용 여부',
        cell: (row: Bouncer) => (
          <StatusBadge
            label={row.used === 'Y' ? '사용 중' : '사용 안함'}
            variant={row.used === 'Y' ? 'success' : 'warning'}
          />
        ),
      },
      { id: 'updated', header: '최근 수정', accessor: (row: Bouncer) => row.updated_at },
    ],
    [],
  );

  const openCreateModal = () => {
    setEditing(null);
    reset({ bouncer_name: '', fin_no: '', fin_no_confirm: '', used: 'Y' });
    setFinVerified(false);
    setModalOpen(true);
  };

  const openEditModal = (row: Bouncer) => {
    setEditing(row);
    reset({
      bouncer_name: row.bouncer_name,
      fin_no: row.fin_no,
      fin_no_confirm: row.fin_no,
      used: row.used,
    });
    setFinVerified(false);
    setModalOpen(true);
  };

  const handleFinCheck = () => {
    const { fin_no, fin_no_confirm } = getValues();
    if (!fin_no || !fin_no_confirm) {
      setFinVerified(false);
      pushToast({ type: 'error', message: 'FIN 번호를 입력하세요.' });
      return;
    }
    if (fin_no !== fin_no_confirm) {
      setFinVerified(false);
      pushToast({ type: 'error', message: 'FIN 번호가 일치하지 않습니다.' });
      return;
    }
    setFinVerified(true);
    pushToast({ type: 'success', message: 'FIN 번호가 확인되었습니다.' });
  };

  const onSubmit = async (values: FormValues) => {
    if (!finVerified) {
      pushToast({ type: 'info', message: 'FIN 번호 확인을 진행하세요.' });
      return;
    }

    const finCheck = await checkFinDuplicated(values.fin_no);
    if (finCheck.duplicated && (!editing || editing.fin_no !== values.fin_no)) {
      pushToast({ type: 'error', message: 'FIN 번호가 중복되었습니다.' });
      return;
    }

    if (editing) {
      updateMutation.mutate({ code: editing.bouncer_code, values });
      return;
    }

    createMutation.mutate({
      bouncer_name: values.bouncer_name,
      fin_no: values.fin_no,
      used: 'Y',
    });
  };

  return (
    <DashboardLayout apartmentName={apartmentName} userName={userName} navItems={navItems} onLogout={logout}>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">경비원 관리</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">경비원 계정을 등록하고 사용 상태를 관리합니다.</p>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => setPage(1)}
          placeholder="경비원 이름으로 검색"
          filters={
            <select
              value={filterUsed}
              onChange={(event) => {
                setFilterUsed(event.target.value as 'Y' | 'N' | '');
                setPage(1);
              }}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">전체</option>
              <option value="Y">사용 중</option>
              <option value="N">사용 안함</option>
            </select>
          }
          actions={
            <button
              type="button"
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              onClick={openCreateModal}
            >
              + 경비원 등록
            </button>
          }
        />

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ) : data && data.items.length > 0 ? (
          <DataTable
            columns={columns}
            data={data.items}
            getRowId={(row) => row.bouncer_code}
            onRowClick={openEditModal}
            pagination={{
              page,
              pageSize: 10,
              total: data.total,
              onPageChange: setPage,
            }}
          />
        ) : (
          <EmptyState
            title="등록된 경비원이 없습니다."
            description="새로운 경비원을 등록해보세요."
            action={
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-400 dark:text-slate-900"
                onClick={openCreateModal}
              >
                경비원 등록
              </button>
            }
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? '경비원 정보 수정' : '경비원 등록'}
        description="FIN 번호는 6자리 숫자입니다."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            {editing && (
              <button
                type="button"
                className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 dark:border-rose-500/40 dark:text-rose-200"
                onClick={() => {
                  setDeleteTarget(editing);
                  setConfirmOpen(true);
                }}
              >
                삭제
              </button>
            )}
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-400 dark:text-slate-900"
              form="bouncer-form"
            >
              {editing ? '수정' : '등록'}
            </button>
          </>
        }
      >
        <form id="bouncer-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField id="bouncer_name" label="경비원명" required error={errors.bouncer_name?.message}>
            <input
              id="bouncer_name"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('bouncer_name')}
            />
          </FormField>
          <FormField id="fin_no" label="FIN 번호" required error={errors.fin_no?.message}>
            <input
              id="fin_no"
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoComplete="off"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('fin_no')}
            />
          </FormField>
          <FormField id="fin_no_confirm" label="FIN 번호 확인" required error={errors.fin_no_confirm?.message}>
            <div className="flex gap-2">
              <input
                id="fin_no_confirm"
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoComplete="off"
                className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('fin_no_confirm')}
              />
              <button
                type="button"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:text-slate-200"
                onClick={handleFinCheck}
              >
                확인
              </button>
            </div>
          </FormField>
          {!editing && <input type="hidden" value="Y" {...register('used')} />}
          {editing && (
            <FormField id="used" label="사용 여부">
              <select
                id="used"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('used')}
              >
                <option value="Y">사용</option>
                <option value="N">미사용</option>
              </select>
            </FormField>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="경비원 삭제"
        description="삭제하면 연관된 데이터 확인이 필요합니다. 계속 진행할까요?"
        confirmLabel="삭제"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.bouncer_code);
          setConfirmOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default BouncerPage;
