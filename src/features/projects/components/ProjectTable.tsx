import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Home, Layout } from 'lucide-react';
import { Table, Column } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Progress } from '@/shared/components/ui/Progress';
import { Button } from '@/shared/components/ui/Button';
import type { Project } from '@/shared/types';
import { formatCurrency } from '@/lib/utils';
// import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar'; 

interface ProjectTableProps {
  data: Project[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    onPageChange: (page: number) => void;
  };
}
export function ProjectTable({
  data,
  pagination
}: ProjectTableProps) {
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'default';
      case 'planning':
        return 'info';
      case 'on_hold':
      case 'delayed':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  const columns: Column<Project>[] = [{
    key: 'name',
    header: 'Project Name',
    render: (project) => (
      <div>
        <p className="font-medium text-gray-900">{project.name}</p>
        <p className="text-xs text-gray-500">{project.companyName}</p>
      </div>
    )
  }, {
    key: 'type',
    header: 'Type',
    render: (project) => (
      <div className="flex items-center gap-2">
        {project.type === 'house' ? <Home className="h-4 w-4 text-purple-600" /> : <Layout className="h-4 w-4 text-blue-600" />}
        <span className="text-sm font-medium text-gray-700 capitalize">{project.type === 'house' ? 'House' : 'Apartment'}</span>
      </div>
    )
  }, {
    key: 'structure',
    header: 'Structure',
    render: (project) => {
      let summary = '';
      if (project.type === 'apartment_building') {
        const unitCount = project.floors.reduce((acc, f) => acc + f.rooms.length, 0);
        summary = `${project.floors.length} Floors • ${unitCount} Units`;
      } else if (project.type === 'house') {
        if (project.projectConfig?.houseType === 'sections') {
          summary = `${project.projectConfig.sections?.length || 0} Sections`;
        } else {
          summary = 'Whole House';
        }
      }
      return <span className="text-sm text-gray-600 font-medium">{summary}</span>;
    }
  }, {
    key: 'status',
    header: 'Status',
    render: (project) => <Badge variant={getStatusColor(project.status)} className="capitalize">{project.status.replace('_', ' ')}</Badge>
  }, {
    key: 'progress',
    header: 'Progress',
    render: (project) => (
      <div className="w-24 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>
    )
  }, {
    key: 'budget',
    header: 'Budget',
    render: (project) => <span className="font-medium text-gray-900">{formatCurrency(project.budget)}</span>
  },
  {
    key: 'endDate',
    header: 'Deadline',
    render: (project) => <span className="text-sm text-gray-600">{project.endDate || 'N/A'}</span>
  }, {
    key: 'actions',
    header: '',
    render: () => (
      <Button variant="ghost" size="icon" className="text-gray-400">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    )
  }];
  return <Table data={data} columns={columns} onRowClick={project => navigate(`/projects/${project.id}`)} />;
}