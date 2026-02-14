import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import DataTable from '@/shared/components/table/DataTable';
import SearchBar from '@/shared/components/form/SearchBar';
import Modal from '@/shared/components/feedback/Modal';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import FormField from '@/shared/components/form/FormField';
import StatusBadge from '@/shared/components/feedback/StatusBadge';
import Skeleton from '@/shared/components/feedback/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import useAuthStore from '@/features/auth/store';
import useUiStore from '@/shared/store/uiStore';
import {
  checkFinDuplicated,
  createBouncer,
  deleteBouncer,
  fetchBouncers,
  updateBouncer,
} from './api';
import type { Bouncer, BouncerListResponse } from './types';
import { maskFin } from './utils';


const createSchema = z
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

const editSchema = z
  .object({
    bouncer_name: z.string().min(1, '경비원 이름을 입력하세요.'),
    current_fin_no: z.string().regex(/^[0-9]{6}$/, '현재 FIN 번호는 6자리 숫자입니다.'),
    new_fin_no: z.string().regex(/^[0-9]{6}$/, '변경 FIN 번호는 6자리 숫자입니다.'),
    new_fin_no_confirm: z.string().regex(/^[0-9]{6}$/, '변경 FIN 번호는 6자리 숫자입니다.'),
    used: z.enum(['Y', 'N']),
  })
  .refine((data) => data.new_fin_no === data.new_fin_no_confirm, {
    message: '변경 FIN 번호가 일치하지 않습니다.',
    path: ['new_fin_no_confirm'],
  });

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

const BouncerPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const currentUserCode = useAuthStore((state) => state.user?.bouncer_code ?? '');
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useUiStore((state) => state.pushToast);

  const [search, setSearch] = useState('');
  const [filterUsed, setFilterUsed] = useState<'Y' | 'N' | ''>('');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bouncer | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Bouncer | null>(null);
  const [createFinVerified, setCreateFinVerified] = useState(false);
  const [editFinVerified, setEditFinVerified] = useState(false);

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
      setCreateModalOpen(false);
      setCreateFinVerified(false);
      pushToast({ type: 'success', message: '경비원을 등록했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '등록에 실패했습니다.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      code,
      payload,
    }: {
      code: string;
      payload: { bouncer_name: string; fin_no: string; used: 'Y' | 'N' };
    }) => updateBouncer(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bouncers'] });
      setEditModalOpen(false);
      setEditing(null);
      setEditFinVerified(false);
      pushToast({ type: 'success', message: '경비원 정보를 수정했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '수정에 실패했습니다.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBouncer,
    onSuccess: (_, bouncerCode) => {
      queryClient.setQueriesData<BouncerListResponse>({ queryKey: ['bouncers'] }, (cached) => {
        if (!cached) return cached;

        const nextItems = cached.items.filter((item) => item.bouncer_code !== bouncerCode);
        const removedCount = cached.items.length - nextItems.length;

        if (removedCount === 0) return cached;

        return {
          ...cached,
          items: nextItems,
          total: Math.max(cached.total - removedCount, 0),
        };
      });

      setConfirmOpen(false);
      setDeleteTarget(null);
      pushToast({ type: 'success', message: '삭제되었습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '삭제에 실패했습니다.' }),
  });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    getValues: getCreateValues,
    formState: { errors: createErrors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { bouncer_name: '', fin_no: '', fin_no_confirm: '', used: 'Y' },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    getValues: getEditValues,
    formState: { errors: editErrors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      bouncer_name: '',
      current_fin_no: '',
      new_fin_no: '',
      new_fin_no_confirm: '',
      used: 'Y',
    },
  });

  const openCreateModal = () => {
    resetCreate({ bouncer_name: '', fin_no: '', fin_no_confirm: '', used: 'Y' });
    setCreateFinVerified(false);
    setCreateModalOpen(true);
  };

  const openEditModal = (row: Bouncer) => {
    setEditing(row);
    resetEdit({
      bouncer_name: row.bouncer_name,
      current_fin_no: '',
      new_fin_no: '',
      new_fin_no_confirm: '',
      used: row.used,
    });
    setEditFinVerified(false);
    setEditModalOpen(true);
  };

  const handleOpenDeleteConfirm = (row: Bouncer) => {
    setDeleteTarget(row);
    setConfirmOpen(true);
  };

  const handleCreateFinCheck = () => {
    const { fin_no, fin_no_confirm } = getCreateValues();

    if (!fin_no || !fin_no_confirm) {
      setCreateFinVerified(false);
      pushToast({ type: 'error', message: 'FIN 번호를 입력하세요.' });
      return;
    }

    if (fin_no !== fin_no_confirm) {
      setCreateFinVerified(false);
      pushToast({ type: 'error', message: 'FIN 번호가 일치하지 않습니다.' });
      return;
    }

    setCreateFinVerified(true);
    pushToast({ type: 'success', message: 'FIN 번호가 확인되었습니다.' });
  };

  const handleEditFinCheck = () => {
    if (!editing) return;

    const { current_fin_no, new_fin_no, new_fin_no_confirm } = getEditValues();

    if (!current_fin_no || !new_fin_no || !new_fin_no_confirm) {
      setEditFinVerified(false);
      pushToast({ type: 'error', message: 'FIN 번호를 모두 입력하세요.' });
      return;
    }

    if (current_fin_no !== editing.fin_no) {
      setEditFinVerified(false);
      pushToast({ type: 'error', message: '현재 FIN 번호가 일치하지 않습니다.' });
      return;
    }

    if (new_fin_no !== new_fin_no_confirm) {
      setEditFinVerified(false);
      pushToast({ type: 'error', message: '변경 FIN 번호가 일치하지 않습니다.' });
      return;
    }

    setEditFinVerified(true);
    pushToast({ type: 'success', message: 'FIN 번호가 확인되었습니다.' });
  };

  const onSubmitCreate = async (values: CreateFormValues) => {
    if (!createFinVerified) {
      pushToast({ type: 'info', message: 'FIN 번호 확인을 진행하세요.' });
      return;
    }

    const finCheck = await checkFinDuplicated(values.fin_no);
    if (finCheck.duplicated) {
      pushToast({ type: 'error', message: 'FIN 번호가 중복되었습니다.' });
      return;
    }

    createMutation.mutate({
      bouncer_name: values.bouncer_name,
      fin_no: values.fin_no,
      used: 'Y',
    });
  };

  const onSubmitEdit = async (values: EditFormValues) => {
    if (!editing) return;

    if (!editFinVerified) {
      pushToast({ type: 'info', message: 'FIN 번호 확인을 진행하세요.' });
      return;
    }

    if (values.new_fin_no !== editing.fin_no) {
      const finCheck = await checkFinDuplicated(values.new_fin_no);
      if (finCheck.duplicated) {
        pushToast({ type: 'error', message: 'FIN 번호가 중복되었습니다.' });
        return;
      }
    }

    updateMutation.mutate({
      code: editing.bouncer_code,
      payload: {
        bouncer_name: values.bouncer_name,
        fin_no: values.new_fin_no,
        used: values.used,
      },
    });
  };

  const rows = data?.items ?? [];

  const columns = [
    { id: 'name', header: '경비원명', accessor: (row: Bouncer) => row.bouncer_name },
    { id: 'fin', header: 'FIN 번호', accessor: (row: Bouncer) => maskFin(row.fin_no) },
    {
      id: 'grade',
      header: '등급',
      cell: (row: Bouncer) => {
        const isManager = row.bouncer_code === currentUserCode;

        return (
          <span
            className={
              isManager
                ? 'inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-200'
                : 'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700/20 dark:text-slate-200'
            }
          >
            <span
              className={
                isManager
                  ? 'h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-300'
                  : 'h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-300'
              }
            />
            {isManager ? '관리' : '일반'}
          </span>
        );
      },
    },
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
    {
      id: 'actions',
      header: '관리',
      align: 'right' as const,
      cell: (row: Bouncer) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>
            수정
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteConfirm(row)}>
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      apartmentName={apartmentName}
      userName={userName}
      onLogout={logout}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">경비원 관리</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              경비원 계정을 등록하고 사용 여부를 관리합니다.
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus size={16} aria-hidden="true" />
            경비원 등록
          </Button>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => setPage(1)}
          filterTitle="사용 여부"
          placeholder="경비원 이름으로 검색"
          filters={
            <Select
              value={filterUsed}
              onChange={(event) => {
                setFilterUsed(event.target.value as 'Y' | 'N' | '');
                setPage(1);
              }}
              className="w-auto"
            >
              <option value="">전체</option>
              <option value="Y">사용 중</option>
              <option value="N">사용 안함</option>
            </Select>
          }
        />

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.bouncer_code}
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
        open={createModalOpen}
        title="경비원 등록"
        description="FIN 번호는 6자리 숫자입니다."
        onClose={() => setCreateModalOpen(false)}
        footer={
          <Button type="submit" form="bouncer-create-form">등록</Button>
        }
      >
        <form
          id="bouncer-create-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmitCreate(onSubmitCreate)}
        >
          <FormField id="create_bouncer_name" label="경비원명" required error={createErrors.bouncer_name?.message}>
            <Input id="create_bouncer_name" {...registerCreate('bouncer_name')} />
          </FormField>

          <FormField id="create_fin_no" label="FIN 번호" required error={createErrors.fin_no?.message}>
            <Input id="create_fin_no" type="password" inputMode="numeric" maxLength={6} autoComplete="off"
              {...registerCreate('fin_no', { onChange: () => setCreateFinVerified(false) })} />
          </FormField>

          <FormField id="create_fin_no_confirm" label="FIN 번호 확인" required error={createErrors.fin_no_confirm?.message}>
            <div className="flex gap-2">
              <Input id="create_fin_no_confirm" type="password" inputMode="numeric" maxLength={6} autoComplete="off"
                {...registerCreate('fin_no_confirm', { onChange: () => setCreateFinVerified(false) })} />
              <Button type="button" variant="outline" onClick={handleCreateFinCheck}>확인</Button>
            </div>
          </FormField>

          <FormField
            id="create_fin_no"
            label="FIN ��호"
            required
            error={createErrors.fin_no?.message}
          >
            <input
              id="create_fin_no"
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoComplete="off"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...registerCreate('fin_no', { onChange: () => setCreateFinVerified(false) })}
            />
          </FormField>

          <FormField
            id="create_fin_no_confirm"
            label="FIN 번호 확인"
            required
            error={createErrors.fin_no_confirm?.message}
          >
            <div className="flex gap-2">
              <input
                id="create_fin_no_confirm"
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoComplete="off"
                className="h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...registerCreate('fin_no_confirm', {
                  onChange: () => setCreateFinVerified(false),
                })}
              />
              <button
                type="button"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:text-slate-200"
                onClick={handleCreateFinCheck}
              >
                확인
              </button>
            </div>
          </FormField>
          <input type="hidden" value="Y" {...registerCreate('used')} />
        </form>
      </Modal>

      <Modal
        open={editModalOpen}
        title="경비원 정보 수정"
        description="현재 FIN 번호와 변경할 FIN 번호를 입력해 확인하세요."
        onClose={() => {
          setEditModalOpen(false);
          setEditing(null);
        }}
        footer={
          <Button type="submit" form="bouncer-edit-form">수정</Button>
        }
      >
        <form id="bouncer-edit-form" className="flex flex-col gap-4" onSubmit={handleSubmitEdit(onSubmitEdit)}>
          <FormField id="edit_bouncer_name" label="경비원명" required error={editErrors.bouncer_name?.message}>
            <Input id="edit_bouncer_name" {...registerEdit('bouncer_name')} />
          </FormField>

          <FormField id="current_fin_no" label="현재 FIN 번호" required error={editErrors.current_fin_no?.message}>
            <Input id="current_fin_no" type="password" inputMode="numeric" maxLength={6} autoComplete="off"
              {...registerEdit('current_fin_no', { onChange: () => setEditFinVerified(false) })} />
          </FormField>

          <FormField id="new_fin_no" label="변경 FIN 번호" required error={editErrors.new_fin_no?.message}>
            <Input id="new_fin_no" type="password" inputMode="numeric" maxLength={6} autoComplete="off"
              {...registerEdit('new_fin_no', { onChange: () => setEditFinVerified(false) })} />
          </FormField>

          <FormField id="new_fin_no_confirm" label="변경 FIN 번호 확인" required error={editErrors.new_fin_no_confirm?.message}>
            <div className="flex gap-2">
              <Input id="new_fin_no_confirm" type="password" inputMode="numeric" maxLength={6} autoComplete="off"
                {...registerEdit('new_fin_no_confirm', { onChange: () => setEditFinVerified(false) })} />
              <Button type="button" variant="outline" onClick={handleEditFinCheck}>확인</Button>
            </div>
          </FormField>

          <FormField id="edit_used" label="사용 여부">
            <Select id="edit_used" {...registerEdit('used')}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </Select>
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="경비원 삭제"
        description="삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.bouncer_code);
          }
        }}
      />
    </DashboardLayout>
  );
};

export default BouncerPage;
