import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import SearchBar from '@/shared/components/form/SearchBar';
import DataTable from '@/shared/components/table/DataTable';
import StatusBadge from '@/shared/components/feedback/StatusBadge';
import Modal from '@/shared/components/feedback/Modal';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import FormField from '@/shared/components/form/FormField';
import Skeleton from '@/shared/components/feedback/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import useAuthStore from '@/features/auth/store';
import useUiStore from '@/shared/store/uiStore';
import type { Notice, NoticeListResponse } from './types';
import {
  createNotice,
  deleteNotice,
  fetchNotices,
  updateNotice,
  updateNoticeVisibility,
} from './api';
import NoticeEditor from './NoticeEditor';

const formSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요.'),
  content: z.string().min(1, '내용을 입력하세요.'),
  is_important: z.boolean(),
  is_visible: z.boolean(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NoticePage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '아파트');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '관리자');
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useUiStore((state) => state.pushToast);

  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState<'true' | 'false' | ''>('');
  const [filterImportant, setFilterImportant] = useState<'true' | 'false' | ''>('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notices', { search, filterVisible, filterImportant, page }],
    queryFn: () =>
      fetchNotices({
        visible: filterVisible ? filterVisible === 'true' : undefined,
        important: filterImportant ? filterImportant === 'true' : undefined,
        search: search || undefined,
        sort: 'created_at_desc',
        page,
        pageSize: 10,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '공지사항을 등록했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '등록에 실패했습니다.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) => updateNotice(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '공지사항을 수정했습니다.' });
    },
    onError: () => pushToast({ type: 'error', message: '수정에 실패했습니다.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: (_, noticeId) => {
      queryClient.setQueriesData<NoticeListResponse>({ queryKey: ['notices'] }, (cached) => {
        if (!cached) return cached;
        const nextItems = cached.items.filter((item) => item.notice_id !== noticeId);
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

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      updateNoticeVisibility(id, visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      is_important: false,
      is_visible: true,
      start_date: '',
      end_date: '',
    },
  });

  const contentValue = watch('content');

  const columns = [
    { id: 'title', header: '제목', accessor: (row: Notice) => row.title },
    {
      id: 'important',
      header: '중요',
      cell: (row: Notice) =>
        row.is_important ? <StatusBadge label="중요" variant="warning" /> : '-',
    },
    {
      id: 'visible',
      header: '공개',
      cell: (row: Notice) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            visibilityMutation.mutate({ id: row.notice_id, visible: !row.is_visible });
          }}
        >
          {row.is_visible ? 'ON' : 'OFF'}
        </Button>
      ),
    },
    { id: 'date', header: '등록일', accessor: (row: Notice) => row.created_at },
    {
      id: 'actions',
      header: '관리',
      align: 'right' as const,
      cell: (row: Notice) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>수정</Button>
          <Button variant="destructive" size="sm" onClick={() => { setDeleteTarget(row); setConfirmOpen(true); }}>삭제</Button>
        </div>
      ),
    },
  ];

  const openCreateModal = () => {
    setEditing(null);
    reset({
      title: '',
      content: '',
      is_important: false,
      is_visible: true,
      start_date: '',
      end_date: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (row: Notice) => {
    setEditing(row);
    reset({
      title: row.title,
      content: row.content,
      is_important: row.is_important,
      is_visible: row.is_visible,
      start_date: row.start_date ?? '',
      end_date: row.end_date ?? '',
    });
    setModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (values.start_date && values.end_date && values.start_date > values.end_date) {
      pushToast({ type: 'error', message: '게시 시작일은 종료일보다 늦을 수 없습니다.' });
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.notice_id, values });
      return;
    }

    createMutation.mutate(values);
  };

  return (
    <DashboardLayout apartmentName={apartmentName} userName={userName} onLogout={logout}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">공지사항 관리</h2>
            <p className="mt-1 text-sm text-muted-foreground">공지사항을 작성하고 노출 상태를 관리합니다.</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus size={16} aria-hidden="true" />
            공지 등록
          </Button>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => setPage(1)}
          filterTitle="노출 조건"
          placeholder="공지사항 검색"
          filters={
            <div className="flex flex-wrap gap-2">
              <Select value={filterVisible} onChange={(event) => { setFilterVisible(event.target.value as 'true' | 'false' | ''); setPage(1); }} className="w-auto">
                <option value="">공개 전체</option>
                <option value="true">공개</option>
                <option value="false">비공개</option>
              </Select>
              <Select value={filterImportant} onChange={(event) => { setFilterImportant(event.target.value as 'true' | 'false' | ''); setPage(1); }} className="w-auto">
                <option value="">중요 전체</option>
                <option value="true">중요</option>
                <option value="false">일반</option>
              </Select>
            </div>
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
            getRowId={(row) => row.notice_id}
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
        title={editing ? '공지사항 수정' : '공지사항 등록'}
        description="중요 여부와 공개 기간을 설정하세요."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button type="submit" form="notice-form">{editing ? '수정' : '등록'}</Button>
            <Button variant="outline" onClick={() => { setPreviewContent(contentValue); setPreviewOpen(true); }}>미리보기</Button>
          </>
        }
      >
        <form id="notice-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField id="title" label="제목" required error={errors.title?.message}>
            <Input id="title" {...register('title')} />
          </FormField>
          <FormField id="content" label="내용" required error={errors.content?.message}>
            <NoticeEditor value={contentValue} onChange={(value) => setValue('content', value)} />
          </FormField>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-foreground">
              <input type="checkbox" {...register('is_important')} /> 중요 공지
            </label>
            <label className="flex items-center gap-2 text-foreground">
              <input type="checkbox" {...register('is_visible')} /> 공개
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField id="start_date" label="게시 시작일">
              <Input id="start_date" type="date" {...register('start_date')} />
            </FormField>
            <FormField id="end_date" label="게시 종료일">
              <Input id="end_date" type="date" {...register('end_date')} />
            </FormField>
          </div>
        </form>
      </Modal>

      <Modal open={previewOpen} title="미리보기" description="현재 작성 중인 내용 화면입니다." onClose={() => setPreviewOpen(false)}>
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <div className="mb-2 text-xs text-muted-foreground">공지내용</div>
          <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: previewContent }} />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="공지사항 삭제"
        description="삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.notice_id); } }}
      />
    </DashboardLayout>
  );
};

export default NoticePage;
