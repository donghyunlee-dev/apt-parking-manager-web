import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import SearchBar from '@/shared/components/form/SearchBar';
import * as XLSX from 'xlsx';
import Modal from '@/shared/components/feedback/Modal';
import FormField from '@/shared/components/form/FormField';
import EmptyState from '@/shared/components/feedback/EmptyState';
import Skeleton from '@/shared/components/feedback/Skeleton';
import useAuthStore from '@/features/auth/store';
import useUiStore from '@/shared/store/uiStore';
import type { ResidentVehicle } from './types';
import {
  bulkUploadResidentVehicles,
  createResidentVehicle,
  deleteResidentVehicle,
  downloadResidentTemplate,
  fetchResidentVehicles,
  updateResidentVehicle,
} from './api';
import ResidentTable from './ResidentTable';
import { vehicleNumberRegex } from './utils';

const navItems = [
  { label: '��ú���', to: '/dashboard' },
  { label: '���� ����', to: '/bouncers' },
  { label: '���ֹ� ���� ����', to: '/residents' },
  { label: '�湮 ���� ����', to: '/visitors' },
  { label: '���� ��ȸ', to: '/reports' },
  { label: '�������� ����', to: '/notices' },
];

const formSchema = z.object({
  building: z.string().min(1, '���� �Է��ϼ���.'),
  unit: z.string().min(1, 'ȣ���� �Է��ϼ���.'),
  vehicle_number: z
    .string()
    .regex(vehicleNumberRegex, '������ȣ ������ �ùٸ��� �ʽ��ϴ�.'),
  phone_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ResidentPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '����Ʈ');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '������');
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useUiStore((state) => state.pushToast);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at_desc');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResidentVehicle | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<{ total: number; success: number; failed: number } | null>(null);
  const [bulkPreview, setBulkPreview] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['resident-vehicles', { search, sort, page }],
    queryFn: () =>
      fetchResidentVehicles({
        vehicle_number: search || undefined,
        building: search || undefined,
        unit: search || undefined,
        phone: search || undefined,
        sort,
        page,
        pageSize: 10,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createResidentVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resident-vehicles'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '������ ����߽��ϴ�.' });
    },
    onError: () => pushToast({ type: 'error', message: '��Ͽ� �����߽��ϴ�.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) =>
      updateResidentVehicle(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resident-vehicles'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '���� ������ �����߽��ϴ�.' });
    },
    onError: () => pushToast({ type: 'error', message: '������ �����߽��ϴ�.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResidentVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resident-vehicles'] });
      pushToast({ type: 'success', message: '���� ������ �����߽��ϴ�.' });
    },
    onError: () => pushToast({ type: 'error', message: '������ �����߽��ϴ�.' }),
  });

  const bulkMutation = useMutation({
    mutationFn: bulkUploadResidentVehicles,
    onSuccess: (result) => {
      setBulkResult(result);
      queryClient.invalidateQueries({ queryKey: ['resident-vehicles'] });
      pushToast({ type: 'success', message: '�ϰ� ����� �Ϸ�Ǿ����ϴ�.' });
    },
    onError: () => pushToast({ type: 'error', message: '�ϰ� ��Ͽ� �����߽��ϴ�.' }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { building: '', unit: '', vehicle_number: '', phone_number: '' },
  });

  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  const renderPagination = () => {
    if (!data) return null;
    return (
      <div className="flex items-center justify-between border border-t-0 border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <span>
          {data.total}�� �� {(page - 1) * 10 + 1}-{Math.min(page * 10, data.total)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 dark:border-slate-700"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ����
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 dark:border-slate-700"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            ����
          </button>
        </div>
      </div>
    );
  };

  const openCreateModal = () => {
    setEditing(null);
    reset({ building: '', unit: '', vehicle_number: '', phone_number: '' });
    setModalOpen(true);
  };

  const openEditModal = (row: ResidentVehicle) => {
    setEditing(row);
    reset({
      building: row.building,
      unit: row.unit,
      vehicle_number: row.vehicle_number,
      phone_number: row.phone_number,
    });
    setModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate({ id: editing.vehicle_id, values });
      return;
    }
    createMutation.mutate(values);
  };

  const handleBulkUpload = () => {
    if (!bulkFile) {
      pushToast({ type: 'error', message: '���ε��� ������ �����ϼ���.' });
      return;
    }
    bulkMutation.mutate(bulkFile);
  };

  const handleTemplateDownload = async () => {
    const { url } = await downloadResidentTemplate();
    window.open(url, '_blank');
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">���ֹ� ���� ����</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">���ֹ� ���� ������ ����ϰ� �����մϴ�.</p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => setPage(1)}
          placeholder="������ȣ, ��/ȣ��, ����ó �˻�"
          filters={
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="created_at_desc">����� �ֽż�</option>
              <option value="building_asc">��/ȣ�� ��������</option>
            </select>
          }
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                onClick={() => setBulkOpen(true)}
              >
                �ϰ� ���
              </button>
              <button
                type="button"
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                onClick={openCreateModal}
              >
                + ���� ���
              </button>
            </div>
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
          <>
            <ResidentTable data={data.items} onRowClick={openEditModal} />
            {renderPagination()}
          </>
        ) : (
          <EmptyState
            title="��ϵ� ������ �����ϴ�."
            description="���� ������ ����غ�����."
            action={
              <button
                type="button"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-400 dark:text-slate-900"
                onClick={openCreateModal}
              >
                ���� ���
              </button>
            }
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? '���� ���� ����' : '���� ���'}
        description="��/ȣ���� ������ȣ�� �Է��ϼ���."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            {editing && (
              <button
                type="button"
                className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 dark:border-rose-500/40 dark:text-rose-200"
                onClick={() => {
                  if (window.confirm('���� �����Ͻðڽ��ϱ�?')) {
                    deleteMutation.mutate(editing.vehicle_id);
                  }
                }}
              >
                ����
              </button>
            )}

            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-400 dark:text-slate-900"
              form="resident-form"
            >
              {editing ? '����' : '���'}
            </button>
          </>
        }
      >
        <form id="resident-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField id="building" label="��" required error={errors.building?.message}>
              <input
                id="building"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('building')}
              />
            </FormField>
            <FormField id="unit" label="ȣ��" required error={errors.unit?.message}>
              <input
                id="unit"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('unit')}
              />
            </FormField>
          </div>
          <FormField id="vehicle_number" label="������ȣ" required error={errors.vehicle_number?.message}>
            <input
              id="vehicle_number"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="12��3456"
              {...register('vehicle_number')}
            />
          </FormField>
          <FormField id="phone_number" label="����ó" helperText="���� �Է�">
            <input
              id="phone_number"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('phone_number')}
            />
          </FormField>
        </form>
      </Modal>

      <Modal
        open={bulkOpen}
        title="���� �ϰ� ���"
        description="Excel ������ ���ε��ϰ� ����� Ȯ���ϼ���."
        onClose={() => setBulkOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200"
              onClick={() => setBulkOpen(false)}
            >
              �ݱ�
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200"
              onClick={handleTemplateDownload}
            >
              ���ø� �ٿ�ε�
            </button>
            <button
              type="button"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-400 dark:text-slate-900"
              onClick={handleBulkUpload}
            >
              ���ε�
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={async (event) => {
              const file = event.target.files?.[0] ?? null;
              setBulkFile(file);
              setBulkResult(null);
              setBulkPreview(null);
              if (file) {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[];
                setBulkPreview(Math.max(0, rows.length - 1));
              }
            }}
          />
          {bulkFile && (
            <p className="text-sm text-slate-600 dark:text-slate-300">���õ� ����: {bulkFile.name}</p>
          )}
          {bulkPreview !== null && (
            <p className="text-sm text-slate-500 dark:text-slate-400">���� ���ε� �Ǽ�: {bulkPreview}��</p>
          )}
          {bulkResult && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
              <p>�� {bulkResult.total}�� �� ���� {bulkResult.success}��</p>
              <p>���� {bulkResult.failed}��</p>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ResidentPage;

