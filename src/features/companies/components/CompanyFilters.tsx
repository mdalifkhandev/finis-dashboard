import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';

interface CompanyFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  industryFilter: string;
  onIndustryChange: (industry: string) => void;
  children?: React.ReactNode;
}

export function CompanyFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  industryFilter,
  onIndustryChange,
  children
}: CompanyFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  const industryOptions = [
    { value: 'all', label: 'All Industries' },
    { value: 'construction', label: 'Construction' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'supplier', label: 'Supplier' }
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search companies..."
            className="pl-10 h-11 bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl focus:shadow-md"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <Select
            options={industryOptions}
            value={industryFilter}
            onChange={(e) => onIndustryChange(e.target.value)}
            className="w-[150px] h-11"
            placeholder="Industry"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-[140px] h-11"
            placeholder="Status"
          />
        </div>
        {children}
      </div>
    </div>
  );
}