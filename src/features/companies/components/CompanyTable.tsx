import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Archive, Building2 } from 'lucide-react';
import { Table, Column } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import { formatCurrency } from '@/shared/utils';
import { Company } from '@/shared/types';

interface CompanyTableProps {
  data: Company[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    onPageChange: (page: number) => void;
  };
}
export function CompanyTable({ data, pagination }: CompanyTableProps) {
  const navigate = useNavigate();
  const columns: Column<Company>[] = [{
    key: 'name',
    header: 'Company',
    render: (row) => <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 rounded-lg border border-gray-100">
        <AvatarImage src={row.logo} />
        <AvatarFallback className="rounded-lg bg-blue-50 text-blue-600">
          {row.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-gray-900">{row.name}</p>
        <p className="text-xs text-gray-500">{row.industry || 'General Contractor'}</p>
      </div>
    </div>
  }, {
    key: 'location',
    header: 'Location',
    render: (row) => <span className="text-sm text-gray-600">{row.location || 'N/A'}</span>
  }, {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const variants: Record<string, string> = {
        active: 'success',
        pending: 'warning',
        inactive: 'secondary'
      };
      return <Badge variant={variants[row.status] as any} className="capitalize">
        {row.status}
      </Badge>;
    }
  }, {
    key: 'annualRevenue',
    header: 'Annual Revenue',
    render: (row) => <span className="font-medium text-gray-900">{row.annualRevenue ? formatCurrency(row.annualRevenue) : '$0'}</span>
  }, {
    key: 'projectCount',
    header: 'Projects',
    render: (row) => <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-gray-400" />
      <span className="font-medium text-gray-700">{row.projectCount}</span>
    </div>
  }, {
    key: 'actions',
    header: '',
    render: (row) => <div className="flex justify-end" onClick={e => e.stopPropagation()}>
      <Dropdown trigger={<button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
        <MoreHorizontal className="h-4 w-4" />
      </button>} items={[{
        label: 'View Details',
        icon: Eye,
        onClick: () => navigate(`/companies/${row.id}`)
      }, {
        label: 'Edit Company',
        icon: Edit,
        onClick: () => console.log('Edit', row.id)
      }, {
        label: 'Archive',
        icon: Archive,
        onClick: () => console.log('Archive', row.id),
        variant: 'destructive'
      }]} />
    </div>
  }];
  return <Table columns={columns} data={data} onRowClick={row => navigate(`/companies/${row.id}`)} />;
}