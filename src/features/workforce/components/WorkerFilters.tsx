import { Search, X, Briefcase, UserCheck, Building } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';

interface WorkerFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleChange: (role: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  projectFilter: string;
  onProjectChange: (project: string) => void;
  projectOptions?: { label: string; value: string }[];
  onClear: () => void;
}

export function WorkerFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  projectFilter,
  onProjectChange,
  projectOptions = [],
  onClear
}: WorkerFiltersProps) {
  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:flex-row md:items-center">
      <div className="flex flex-1 flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1D4F6D] transition-colors" />
          <Input
            placeholder="Search by name, email or role..."
            className="pl-10 h-11 border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-xl shadow-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            placeholder="All Roles"
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            startIcon={<Briefcase className="h-4 w-4" />}
            options={[
              { label: 'All Roles', value: 'all' },
              { label: 'Electrician', value: 'Electrician' },
              { label: 'Plumber', value: 'Plumber' },
              { label: 'Carpenter', value: 'Carpenter' },
              { label: 'Site Manager', value: 'Site Manager' },
              { label: 'Engineer', value: 'Engineer' }
            ]}
          />
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            startIcon={<UserCheck className="h-4 w-4" />}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'On Leave', value: 'leave' },
              { label: 'Inactive', value: 'inactive' }
            ]}
          />
          <Select
            placeholder="All Projects"
            value={projectFilter}
            onChange={(e) => onProjectChange(e.target.value)}
            startIcon={<Building className="h-4 w-4" />}
            options={[
              { label: 'All Projects', value: 'all' },
              ...projectOptions
            ]}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || projectFilter !== 'all') && (
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            onClick={onClear}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
