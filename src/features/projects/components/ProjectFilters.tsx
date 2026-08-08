import React from 'react';
import { LayoutGrid, Table2, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { cn } from '@/shared/utils';

interface ProjectFiltersProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  children
}: Omit<ProjectFiltersProps, 'view' | 'onViewChange'> & { children?: React.ReactNode }) {
  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'delayed', label: 'Delayed' }
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, company, location..."
            className="pl-10 h-11 bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl focus:shadow-md"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Status Filter */}
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-[150px] h-11"
        />
        {children}
      </div>
    </div>
  );
}
