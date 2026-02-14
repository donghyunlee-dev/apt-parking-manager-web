import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import SearchBar from '@/shared/components/form/SearchBar';
import StatusBadge from '@/shared/components/feedback/StatusBadge';
import Modal from '@/shared/components/feedback/Modal';
import FormField from '@/shared/components/form/FormField';
import EmptyState from '@/shared/components/feedback/EmptyState';
import Skeleton from '@/shared/components/feedback/Skeleton';
import useAuthStore from '@/features/auth/store';
import useUiStore from '@/shared/store/uiStore';
import type { Notice } from './types';
import {
  createNotice,
  deleteNotice,
  fetchNotices,
  updateNotice,
  updateNoticeVisibility,
} from './api';
import NoticeEditor from './NoticeEditor';

const navItems = [
  { label: '��ú���', to: '/dashboard' },
  { label: '���� ����', to: '/bouncers' },
  { label: '���ֹ� ���� ����', to: '/residents' },
  { label: '�湮 ���� ����', to: '/visitors' },
  { label: '���� ��ȸ', to: '/reports' },
  { label: '�������� ����', to: '/notices' },
];

const formSchema = z.object({
  title: z.string().min(1, '������ �Է��ϼ���.'),
  content: z.string().min(1, '������ �Է��ϼ���.'),
  is_important: z.boolean(),
  is_visible: z.boolean(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NoticePage = () => {
  const apartmentName = useAuthStore((state) => state.apartment?.apt_name ?? '');
  const userName = useAuthStore((state) => state.user?.bouncer_name ?? '');
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
  const [orderedNotices, setOrderedNotices] = useState<Notice[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

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

  const filteredNotices = useMemo(() => data?.items ? [], [data]);

  useEffect(() => {
    setOrderedNotices(filteredNotices);
  }, [filteredNotices]);

  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '���������� ����߽��ϴ�.' });
    },
    onError: () => pushToast({ type: 'error', message: '��Ͽ� �����߽��ϴ�.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) => updateNotice(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setModalOpen(false);
      pushToast({ type: 'success', message: '���������� �����߽��ϴ�.' });
    },
    onError: () => pushToast({ type: 'error', message: '������ �����߽��ϴ�.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      pushToast({ type: 'success', message: '���������� �����߽��ϴ�.' });
    },
    onError: () => pushToast({ type: 'error', message: '������ �����߽��ϴ�.' }),
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

  const columns = useMemo(
    () => [
      { id: 'title', header: '����', accessor: (row: Notice) => row.title },
      {
        id: 'important',
        header: '�߿�',
        cell: (row: Notice) =>
          row.is_important ? <StatusBadge label="�߿�" variant="warning" /> : '-',
      },
      {
        id: 'visible',
        header: '����',
        cell: (row: Notice) => (
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:text-slate-200"
            onClick={(event) => {
              event.stopPropagation();
              visibilityMutation.mutate({ id: row.notice_id, visible: !row.is_visible });
            }}
          >
            {row.is_visible ? 'ON' : 'OFF'}
          </button>
        ),
      },
      { id: 'date', header: '�����', accessor: (row: Notice) => row.created_at },
    ],
    [visibilityMutation],
  );

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const current = [...orderedNotices];
    const fromIndex = current.findIndex((item) => item.notice_id === dragId);
    const toIndex = current.findIndex((item) => item.notice_id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setOrderedNotices(current);
  };

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
      start_date: row.start_date ? '',
      end_date: row.end_date ? '',
    });
    setModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (values.start_date && values.end_date && values.start_date > values.end_date) {
      pushToast({ type: 'error', message: '�������� �����Ϻ��� ���� �� �����ϴ�.' });
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.notice_id, values });
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">�������� ����</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">���������� ����ϰ� ���� ���¸� �����մϴ�.</p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => setPage(1)}
          placeholder="�������� �˻�"
          filters={
            <div className="flex flex-wrap gap-2">
              <select
                value={filterVisible}
                onChange={(event) => {
                  setFilterVisible(event.target.value as 'true' | 'false' | '');
                  setPage(1);
                }}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">���� ��ü</option>
                <option value="true">����</option>
                <option value="false">�����</option>
              </select>
              <select
                value={filterImportant}
                onChange={(event) => {
                  setFilterImportant(event.target.value as 'true' | 'false' | '');
                  setPage(1);
                }}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">�߿� ��ü</option>
                <option value="true">�߿�</option>
                <option value="false">�Ϲ�</option>
              </select>
            </div>
          }
          actions={
            <button
              type="button"
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              onClick={openCreateModal}
            >
              + ���� ���
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
        ) : orderedNotices.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    ����
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderedNotices.map((row) => (
                  <tr
                    key={row.notice_id}
                    draggable
                    onDragStart={() => setDragId(row.notice_id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(row.notice_id)}
                    className="cursor-move transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => openEditModal(row)}
                  >
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">::</td>
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {column.cell ? column.cell(row) : column.accessor?.(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              �巡�׷� ������ ������ �� �ֽ��ϴ�. (���� ������ ��)
            </div>
          </div>
        ) : (
          <EmptyState
            title="���������� �����ϴ�."
            description="���ο� ���������� ����غ�����."
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
        title={editing ? '�������� ����' : '�������� ���'}
        description="�߿� ���� ���ο� ���� �Ⱓ�� �����ϼ���."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            {editing && (
              <button
                type="button"
                className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 dark:border-rose-500/40 dark:text-rose-200"
                onClick={() => {
                  if (window.confirm('���� �����Ͻðڽ��ϱ�?')) {
                    deleteMutation.mutate(editing.notice_id);
                  }
                }}
              >
                ����
              </button>
            )}

            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-emerald-400 dark:text-slate-900"
              form="notice-form"
            >
              {editing ? '����' : '���'}
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200"
              onClick={() => {
                setPreviewContent(contentValue);
                setPreviewOpen(true);
              }}
            >
              �̸�����
            </button>
          </>
        }
      >
        <form id="notice-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField id="title" label="����" required error={errors.title?.message}>
            <input
              id="title"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('title')}
            />
          </FormField>
          <FormField id="content" label="����" required error={errors.content?.message}>
            <NoticeEditor value={contentValue} onChange={(value) => setValue('content', value)} />
          </FormField>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input type="checkbox" {...register('is_important')} /> �߿� ����
            </label>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input type="checkbox" {...register('is_visible')} /> ����
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField id="start_date" label="���� ������">
              <input
                id="start_date"
                type="date"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('start_date')}
              />
            </FormField>
            <FormField id="end_date" label="���� ������">
              <input
                id="end_date"
                type="date"
                className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('end_date')}
              />
            </FormField>
          </div>
        </form>
      </Modal>

      <Modal
        open={previewOpen}
        title="�̸�����"
        description="����� �� ���� ȭ�� �����Դϴ�."
        onClose={() => setPreviewOpen(false)}
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 text-xs text-slate-400">��������</div>
          <div
            className="prose max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default NoticePage;

