import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Upload } from 'lucide-react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import SearchBar from '@/shared/components/form/SearchBar';
import DataTable from '@/shared/components/table/DataTable';
import * as XLSX from 'xlsx';
import Modal from '@/shared/components/feedback/Modal';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import FormField from '@/shared/components/form/FormField';
import Skeleton from '@/shared/components/feedback/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import useAuthStore from '@/features/auth/store';
import useUiStore from '@/shared/store/uiStore';
import type { ResidentVehicle, ResidentVehicleListResponse } from './types';
import {
  bulkUploadResidentVehicles,
  createResidentVehicle,
  deleteResidentVehicle,
  downloadResidentTemplate,
  fetchResidentVehicles,
  updateResidentVehicle,
} from './api';
import { vehicleNumberRegex } from './utils';

const formSchema = z.object({
  building: z.string().min(1, '동을 입력하세요.'),
  unit: z.string().min(1, '호수를 입력하세요.'),
  vehicle_number: z.string().regex(vehicleNumberRegex, '차량번호 형식이 올바르지 않습니다.'),
  phone_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ResidentPage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useUiStore((state) => state.pushToast);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at_desc');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResidentVehicle | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);
  const [bulkPreview, setBulkPreview] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResidentVehicle | null>(null);

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
      pushToast({ type: 'success', message: '입주민 차량을 등록했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '등록에 실패했습니다.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) =>
      updateResidentVehicle(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resident-vehicles'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '입주민 차량 정보를 수정했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '수정에 실패했습니다.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResidentVehicle,
    onSuccess: (_, vehicleId) => {
      queryClient.setQueriesData<ResidentVehicleListResponse>(
        { queryKey: ['resident-vehicles'] },
        (cached) => {
          if (!cached) return cached;
          const nextItems = cached.items.filter((item) => item.vehicle_id !== vehicleId);
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

  const bulkMutation = useMutation({
    mutationFn: bulkUploadResidentVehicles,
    onSuccess: (result) => {
      setBulkResult(result);
      queryClient.invalidateQueries({ queryKey: ['resident-vehicles'] });
      pushToast({ type: 'success', message: '일괄 등록이 완료되었습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '일괄 등록에 실패했습니다.' }),
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

  const columns = [
    {
      id: 'unit',
      header: '동/호수',
      accessor: (row: ResidentVehicle) => `${row.building}동 ${row.unit}호`,
    },
    { id: 'vehicle', header: '차량번호', accessor: (row: ResidentVehicle) => row.vehicle_number },
    { id: 'phone', header: '연락처', accessor: (row: ResidentVehicle) => row.phone_number ?? '-' },
    { id: 'updated', header: '최근 수정', accessor: (row: ResidentVehicle) => row.updated_at },
    {
      id: 'actions',
      header: '관리',
      align: 'right' as const,
      cell: (row: ResidentVehicle) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>수정</Button>
          <Button variant="destructive" size="sm" onClick={() => { setDeleteTarget(row); setConfirmOpen(true); }}>삭제</Button>
        </div>
      ),
    },
  ];

  const handleBulkUpload = () => {
    if (!bulkFile) {
      pushToast({ type: 'error', message: '업로드할 파일을 선택하세요.' });
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
      onLogout={logout}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">입주민 차량 관리</h2>
            <p className="mt-1 text-sm text-muted-foreground">입주민 차량 정보를 등록하고 관리합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setBulkOpen(true)}>
              <Upload size={14} aria-hidden="true" />
              일괄 등록
            </Button>
            <Button onClick={openCreateModal}>
              <Plus size={16} aria-hidden="true" />
              차량 등록
            </Button>
          </div>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => setPage(1)}
          filterTitle="정렬 조건"
          placeholder="차량번호, 동/호수, 연락처 검색"
          filters={
            <Select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="w-auto">
              <option value="created_at_desc">등록일 최신순</option>
              <option value="building_asc">동/호수 오름차순</option>
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
            data={data?.items ?? []}
            getRowId={(row) => row.vehicle_id}
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
        title={editing ? '차량 정보 수정' : '차량 등록'}
        description="동/호수와 차량번호를 입력하세요."
        onClose={() => setModalOpen(false)}
        footer={<Button type="submit" form="resident-form">{editing ? '수정' : '등록'}</Button>}
      >
        <form id="resident-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField id="building" label="동" required error={errors.building?.message}>
              <Input id="building" {...register('building')} />
            </FormField>
            <FormField id="unit" label="호수" required error={errors.unit?.message}>
              <Input id="unit" {...register('unit')} />
            </FormField>
          </div>
          <FormField id="vehicle_number" label="차량번호" required error={errors.vehicle_number?.message}>
            <Input id="vehicle_number" placeholder="12가3456" {...register('vehicle_number')} />
          </FormField>
          <FormField id="phone_number" label="연락처" helperText="선택 입력">
            <Input id="phone_number" {...register('phone_number')} />
          </FormField>
        </form>
      </Modal>

      <Modal
        open={bulkOpen}
        title="차량 일괄 등록"
        description="Excel 파일을 업로드하고 결과를 확인하세요."
        onClose={() => setBulkOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkOpen(false)}>닫기</Button>
            <Button variant="outline" onClick={handleTemplateDownload}>템플릿 다운로드</Button>
            <Button onClick={handleBulkUpload}>업로드</Button>
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
            <p className="text-sm text-foreground">
              선택한 파일: {bulkFile.name}
            </p>
          )}
          {bulkPreview !== null && (
            <p className="text-sm text-muted-foreground">
              예상 업로드 건수: {bulkPreview}건
            </p>
          )}
          {bulkResult && (
            <div className="rounded-lg border border-border bg-muted p-4 text-sm">
              <p>총 {bulkResult.total}건 중 성공 {bulkResult.success}건</p>
              <p>실패 {bulkResult.failed}건</p>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="입주민 차량 삭제"
        description="삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.vehicle_id);
          }
        }}
      />
    </DashboardLayout>
  );
};

export default ResidentPage;
