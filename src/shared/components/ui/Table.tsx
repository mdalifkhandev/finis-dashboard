import React from 'react';
import { cn } from '@/shared/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  className?: string;

  // Pagination Props
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    onPageChange: (page: number) => void;
  };
}

export function Table<T extends {
  id: string | number;
}>({
  data,
  columns,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  className,
  pagination
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead className="bg-gray-50/50 [&_tr]:border-b">
            <tr className="border-b border-gray-200 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-black text-[#1D4F6D] text-[10px] uppercase tracking-widest [&:has([role=checkbox])]:pr-0',
                    column.sortable && 'cursor-pointer select-none hover:text-[#1D4F6D]/70',
                    column.className
                  )}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {data && data.length > 0 ? (
              data.map(item => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-gray-100 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-muted',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(column => (
                    <td key={`${item.id}-${column.key}`} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Showing <span className="text-[#1D4F6D]">{data.length}</span> of <span className="text-[#1D4F6D]">{pagination.totalResults}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="mr-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Page <span className="text-[#1D4F6D]">{pagination.currentPage}</span> of <span className="text-[#1D4F6D]">{pagination.totalPages}</span>
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}