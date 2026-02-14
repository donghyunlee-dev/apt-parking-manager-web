import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
}: DataTableProps<T>) => {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: (number | 'ellipsis')[] = [];
    const current = pagination.page;
    const total = totalPages;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('ellipsis');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('ellipsis');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    alignClass(column.align),
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedRowIds?.includes(rowId);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'transition-colors hover:bg-muted/40',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-primary/5',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn('px-4 py-3 text-foreground', alignClass(column.align))}
                    >
                      {column.cell?.(row) ?? column.accessor?.(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</div>
      )}

      {pagination && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {pagination.total}개 중{' '}
            <span className="font-medium text-foreground">
              {(pagination.page - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                    page === pagination.page
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'border border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  onClick={() => pagination.onPageChange(page)}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              onClick={() =>
                pagination.onPageChange(Math.min(totalPages, pagination.page + 1))
              }
              disabled={pagination.page >= totalPages}
              aria-label="다음 페이지"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
