import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  loadingMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function GenericTable<T>({
  data,
  columns,
  isLoading = false,
  loadingMessage = 'Querying database...',
  emptyMessage = 'No records found',
  keyExtractor,
}: GenericTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/50 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            {columns.map((col) => (
              <th key={col.key} className={`px-lg py-3 ${col.headerClassName || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/30 text-xs">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 text-on-surface-variant font-medium">
                {loadingMessage}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 text-on-surface-variant">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-surface-container-low transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className={`px-lg py-4 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(item) : (item[col.key as keyof T] as unknown as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
