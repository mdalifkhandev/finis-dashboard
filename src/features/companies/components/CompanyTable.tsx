import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Building2, ShieldAlert, CheckCircle2, Mail, Lock } from 'lucide-react';
import { Table, Column } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import { formatCurrency, cn } from '@/shared/utils';
import { Company } from '@/shared/types';

interface CompanyTableProps {
  data: Company[];
  isSuperAdmin?: boolean;
  onToggleStatus?: (companyId: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    onPageChange: (page: number) => void;
  };
}

export function CompanyTable({ data, isSuperAdmin = false, onToggleStatus, pagination }: CompanyTableProps) {
  const navigate = useNavigate();

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Company',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg border border-gray-100">
            <AvatarImage src={row.logo} />
            <AvatarFallback className="rounded-lg bg-blue-50 text-blue-600 font-bold">
              {row.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.industry || 'General Contractor'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner' as keyof Company,
      header: 'Owner / Admin',
      render: (row: Company) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {row.owner?.fullName || row.contact?.name || 'Admin'}
          </p>
          <p className="text-xs text-gray-400">
            {row.owner?.email || row.contact?.email || 'No email'}
          </p>
        </div>
      ),
    },
    {
      key: 'subscription' as any,
      header: 'Subscription',
      render: (row: Company) => {
        const planName = row.subscription?.planName || 'No Plan';
        const hasSub = row.subscription?.hasSubscription;
        const subStatus = row.subscription?.status || 'none';
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900 text-xs">{planName}</span>
            <span
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold rounded-full w-fit uppercase tracking-wider',
                hasSub
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              )}
            >
              {subStatus === 'active' ? 'Active' : (hasSub ? subStatus : 'No Subscription')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'location',
      header: 'Location',
      render: (row) => <span className="text-sm text-gray-600">{row.location || 'N/A'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const isSuspended = row.status === 'inactive';
        const variants: Record<string, string> = {
          active: 'success',
          pending: 'warning',
          inactive: 'destructive',
        };
        return (
          <Badge variant={(isSuspended ? 'destructive' : variants[row.status]) as any} className="capitalize">
            {isSuspended ? 'Suspended' : row.status}
          </Badge>
        );
      },
    },
    {
      key: 'annualRevenue',
      header: 'Annual Revenue',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.annualRevenue ? formatCurrency(row.annualRevenue) : '$0'}
        </span>
      ),
    },
    {
      key: 'projectCount',
      header: 'Projects',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-700">{row.projectCount}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        const isSuspended = row.status === 'inactive';
        const items = [
          {
            label: isSuspended && !isSuperAdmin ? 'View Details (Suspended)' : 'View Details',
            icon: isSuspended && !isSuperAdmin ? Lock : Eye,
            onClick: () => {
              if (isSuspended && !isSuperAdmin) {
                alert('This company has been suspended by Super Admin. You cannot view company details.');
                return;
              }
              navigate(`/companies/${row.id}`);
            },
          },
          ...(isSuperAdmin ? [{
            label: row.status === 'active' ? 'Suspend Company' : 'Activate Company',
            icon: row.status === 'active' ? ShieldAlert : CheckCircle2,
            onClick: () => onToggleStatus?.(row.id),
            variant: row.status === 'active' ? ('destructive' as const) : undefined,
          }] : []),
          {
            label: isSuperAdmin ? 'Contact Owner' : 'Contact Support',
            icon: Mail,
            onClick: () => {
              const email = row.owner?.email || row.contact?.email;
              if (isSuperAdmin) {
                if (email) {
                  window.open(`mailto:${email}?subject=Finis Platform: Regarding ${encodeURIComponent(row.name)}`);
                } else {
                  alert('No contact email found for this company owner');
                }
              } else {
                window.location.href = `mailto:support@finis.com?subject=Regarding suspended company: ${encodeURIComponent(row.name)}`;
              }
            },
          },
        ];

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
              items={items}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      pagination={pagination}
      onRowClick={(row) => {
        if (row.status === 'inactive' && !isSuperAdmin) {
          alert('This company has been suspended by Super Admin. You cannot view company details while it is suspended.');
          return;
        }
        navigate(`/companies/${row.id}`);
      }}
    />
  );
}