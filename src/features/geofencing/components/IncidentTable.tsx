import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/Badge';
import { Table } from '@/shared/components/ui/Table';
import { MoreHorizontal, Eye, Edit, FileText } from 'lucide-react';
import { Dropdown } from '@/shared/components/ui/Dropdown';
const incidents = [{
  id: 'INC-2024-001',
  date: '2024-03-15',
  severity: 'High',
  type: 'Injury',
  location: 'Site A - Zone 3',
  reportedBy: 'John Smith',
  status: 'Under Investigation'
}, {
  id: 'INC-2024-002',
  date: '2024-03-14',
  severity: 'Low',
  type: 'Near Miss',
  location: 'Site B - Warehouse',
  reportedBy: 'Sarah Johnson',
  status: 'Resolved'
}, {
  id: 'INC-2024-003',
  date: '2024-03-12',
  severity: 'Medium',
  type: 'Property Damage',
  location: 'Site A - Parking',
  reportedBy: 'Mike Wilson',
  status: 'Closed'
}, {
  id: 'INC-2024-004',
  date: '2024-03-10',
  severity: 'Critical',
  type: 'Environmental',
  location: 'Site C - Perimeter',
  reportedBy: 'David Brown',
  status: 'Reported'
}, {
  id: 'INC-2024-005',
  date: '2024-03-08',
  severity: 'Low',
  type: 'Other',
  location: 'Site B - Office',
  reportedBy: 'Emma Davis',
  status: 'Closed'
}];
export function IncidentTable() {
  const navigate = useNavigate();
  const columns = [{
    key: 'id',
    header: 'ID',
    accessorKey: 'id',
    cell: (row: any) => <span className="font-medium text-gray-900">{row.id}</span>
  }, {
    key: 'date',
    header: 'Date',
    accessorKey: 'date'
  }, {
    key: 'severity',
    header: 'Severity',
    accessorKey: 'severity',
    cell: (row: any) => {
      const variants: Record<string, any> = {
        Critical: 'destructive',
        High: 'warning',
        Medium: 'warning',
        Low: 'info'
      };
      return <Badge variant={variants[row.severity] || 'default'}>
            {row.severity}
          </Badge>;
    }
  }, {
    key: 'type',
    header: 'Type',
    accessorKey: 'type'
  }, {
    key: 'location',
    header: 'Location',
    accessorKey: 'location'
  }, {
    key: 'reportedBy',
    header: 'Reported By',
    accessorKey: 'reportedBy'
  }, {
    key: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: (row: any) => {
      const variants: Record<string, any> = {
        Reported: 'secondary',
        'Under Investigation': 'warning',
        Resolved: 'success',
        Closed: 'default'
      };
      return <Badge variant={variants[row.status] || 'secondary'}>
            {row.status}
          </Badge>;
    }
  }, {
    key: 'actions',
    header: 'Actions',
    id: 'actions',
    cell: (row: any) => <Dropdown trigger={<button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>} items={[{
      label: 'View Details',
      icon: Eye,
      onClick: () => navigate(`/safety/incidents/${row.id}`)
    }, {
      label: 'Update Status',
      icon: Edit,
      onClick: () => {}
    }, {
      label: 'Add Note',
      icon: FileText,
      onClick: () => {}
    }]} />
  }];
  return <Table data={incidents} columns={columns} onRowClick={row => navigate(`/safety/incidents/${row.id}`)} />;
}
