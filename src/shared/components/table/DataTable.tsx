import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  cell?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedRowIds?: string[];
  pagination?: DataTablePagination;
  emptyMessage?: string;
}

const alignClass = (align?: DataTableColumn<unknown>['align']) => {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
};

const DataTable = <T,>({
  columns,
  data,
  getRowId,
  onRowClick,
  selectedRowIds,
  pagination,
  emptyMessage = '데이터가 없습니다.',
}: DataTableProps<T>) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
      <thead className="bg-slate-50 dark:bg-slate-800">
        <tr>
          {columns.map((column) => (
            <th
              key={column.id}
              className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400', alignClass(column.align))}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selectedRowIds?.includes(rowId);

          return (
            <tr
              key={rowId}
              className={cn(
                'transition hover:bg-slate-50 dark:hover:bg-slate-800',
                onRowClick && 'cursor-pointer',
                isSelected && 'bg-slate-100 dark:bg-slate-800',
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn('px-4 py-3 text-slate-700 dark:text-slate-200', alignClass(column.align))}
                >
                  {column.cell?.(row) ?? column.accessor?.(row)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
    {data.length === 0 && (
      <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</div>
    )}
    {pagination && (
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
        <span>
          {pagination.total}개 중 {(pagination.page - 1) * pagination.pageSize + 1}-
          {Math.min(pagination.page * pagination.pageSize, pagination.total)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 dark:border-slate-700"
            onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            이전
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 dark:border-slate-700"
            onClick={() =>
              pagination.onPageChange(
                Math.min(
                  Math.ceil(pagination.total / pagination.pageSize),
                  pagination.page + 1,
                ),
              )
            }
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
          >
            다음
          </button>
        </div>
      </div>
    )}
  </div>
);

export default DataTable;
